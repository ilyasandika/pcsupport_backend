import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import {
  Between,
  Brackets,
  DataSource,
  EntityManager,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import Mustache from 'mustache';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { AssetAssignmentsService } from '../asset_assignments/asset_assignments.service';
import { TrendRange } from '../../common/enums/common.enum';
import { plainToInstance } from 'class-transformer';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TemplatesService } from '../templates/templates.service';
import { TemplateType } from '../templates/entities/template.entity';
import { AssignmentType } from '../../common/enums/assignment-type.enum';
import path from 'node:path';
import * as fs from 'node:fs';
import { createReadStream, existsSync, ReadStream } from 'node:fs';
import libre from 'libreoffice-convert';
import { promisify } from 'node:util';
import { formatTicketDateTime, getSignatureBuffer } from '../../helper';
import { join } from 'path';
import { UsersService } from '../users/users.service';
import createReport from 'docx-templates';
import { CreateTicketPdfDto } from './dto/create-ticket-pdf.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { paginateQb } from '../../common/utils/paginate.util';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Role } from '../../common/enums/role.enum';
import { SlaPoliciesService } from '../sla-policies/sla-policies.service';
import { AssetsService } from '../assets/assets.service';
import { Employee } from '../employees/entities/employee.entity';
import { TicketSnapshot } from './interfaces/ticket-snapshot.interface';
import * as XLSX from 'xlsx';
import { WorkLocationsService } from '../work-locations/work-locations.service';
import { RawTicketExcelRow } from '../../common/interfaces/raw-ticket-excel.interface';
import dayjs from 'dayjs';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly templateService: TemplatesService,
    private readonly userService: UsersService,
    private readonly assetService: AssetsService,
    private readonly slaPolicyService: SlaPoliciesService,
    private readonly workLocationsService: WorkLocationsService,
    @Inject(forwardRef(() => AssetAssignmentsService))
    private readonly assetAssignmentService: AssetAssignmentsService,
    private dataSource: DataSource,
  ) {}

  async create(
    dto: CreateTicketDto,
    creatorId: number,
    externalManager?: EntityManager,
  ) {
    const executeOperation = async (manager: EntityManager) => {
      let userNonEmployeeName: string | undefined = undefined;

      if (dto.assetTag && externalManager == undefined) {
        const assetAssignment =
          await this.assetAssignmentService.findLatestByAssetTag(
            dto.assetTag,
            manager,
          );
        if (!assetAssignment) {
          throw new BadRequestException(
            'This is a new asset, please assign the asset first.',
          );
        }
        if (
          assetAssignment.picEmployeeNik !== dto.employeeNik ||
          assetAssignment.returnedAt
        ) {
          throw new BadRequestException(
            'The specified asset does not belong to this employee or has been returned.',
          );
        }
        userNonEmployeeName = assetAssignment.userNonEmployeeName;
      }

      let nextNumber: number | undefined = undefined;
      let fullNumber: string | undefined = undefined;

      if (dto.engineerId) {
        const latestTicket = await manager.findOne(Ticket, {
          where: { sequenceNumber: Not(IsNull()) },
          order: { sequenceNumber: 'DESC' },
          lock: { mode: 'pessimistic_write' },
        });
        nextNumber = (latestTicket?.sequenceNumber ?? 0) + 1;
        fullNumber = this.getFullNumber(nextNumber, dto.fullNumberTemplate);
      }

      const slaPolicyDefault = await this.slaPolicyService.findDefault();
      const ticketStatus = dto.status
        ? dto.status
        : dto.engineerId
          ? TicketStatus.InProgress
          : TicketStatus.Open;

      const employee = await manager.findOne(Employee, {
        where: { nik: dto.employeeNik },
      });

      const snapshot: TicketSnapshot = {
        position: employee?.position,
        department: employee?.department,
        division: employee?.division,
        userNonEmployee: dto.userNonEmployeeName ?? userNonEmployeeName,
      };

      const newTicket = manager.create(Ticket, {
        ...dto,
        sequenceNumber: dto.engineerId ? nextNumber : undefined,
        slaPolicyId: dto.slaPolicyId ?? slaPolicyDefault.id,
        engineerId: dto.engineerId ?? undefined,
        createdByUserId: creatorId,
        snapshot,
        contact: dto.contact,
        status: ticketStatus,
        startAt: dto.engineerId ? new Date() : undefined,
        fullNumber,
        isAssetAssignment: dto.isAssetAssignment ?? false,
        assignmentType: dto.assignmentType ?? undefined,
      });

      return await manager.save(Ticket, newTicket);
    };

    try {
      if (externalManager) {
        return await executeOperation(externalManager);
      } else {
        return await this.ticketRepository.manager.transaction(
          executeOperation,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('server is busy');
    }
  }

  async claimTicket(id: number, engineerId: number) {
    try {
      return await this.ticketRepository.manager.transaction(
        async (manager) => {
          const ticket = await manager.findOne(Ticket, {
            where: { id },
            lock: { mode: 'pessimistic_write' },
          });

          if (ticket?.engineerId)
            throw new BadRequestException(
              'ticket has been claimed by another engineer',
            );

          const latestTicket = await manager.findOne(Ticket, {
            where: {
              sequenceNumber: Not(IsNull()),
            },
            order: { sequenceNumber: 'DESC' },
            lock: { mode: 'pessimistic_write' },
          });
          const nextNumber: number = (latestTicket?.sequenceNumber ?? 0) + 1;

          const fullNumber = this.getFullNumber(nextNumber);

          if (!ticket) throw new NotFoundException('ticket not found');

          ticket.engineerId = engineerId;
          ticket.startAt = new Date();
          ticket.status = TicketStatus.InProgress;
          ticket.fullNumber = fullNumber;
          ticket.sequenceNumber = nextNumber;

          const updatedTicket = manager.create(Ticket, ticket);
          return await manager.save(Ticket, updatedTicket);
        },
      );
    } catch {
      throw new BadRequestException('this ticket is already taken');
    }
  }

  private getFullNumber(nextNumber: number, template?: string): string {
    return template
      ? Mustache.render(template, {
          sequenceNumber: nextNumber,
        })
      : `${nextNumber}`;
  }

  async findAll(
    query: TicketQueryDto,
    user: JwtPayload,
    forDashboard: boolean = false,
  ): Promise<PaginatedResponseDto<TicketResponseDto>> {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.asset', 'asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.assetAssignments', 'assetAssignments')
      .leftJoinAndSelect('assetAssignments.employee', 'assignmentEmployee')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.engineer', 'engineer')
      .leftJoinAndSelect('ticket.approvedBy', 'approvedBy')
      .leftJoinAndSelect('ticket.employee', 'employee')
      .leftJoinAndSelect('employee.workLocation', 'workLocation')
      .leftJoinAndSelect('ticket.location', 'location')
      .leftJoinAndSelect('ticket.slaPolicy', 'slaPolicy')
      .withDeleted();

    if (query.ticketType && query.ticketType.length > 0) {
      const dbTypes = query.ticketType.filter((type) => type !== 'work order');

      const hasWorkOrder = query.ticketType.includes('work order');

      if (dbTypes.length > 0) {
        qb.andWhere('ticket.assignmentType IN (:...dbTypes)', { dbTypes });
      }

      if (hasWorkOrder) {
        qb.andWhere('ticket.assignmentType IS NULL');
      }
    }

    if (query.asset) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('ticket.assetTag ILike :asset', {
              asset: `%${query.asset}%`,
            })
            .orWhere('asset.serialNumber ILike :asset', {
              asset: `%${query.asset}%`,
            });
        }),
      );
    } else {
      if (query.assetTag) {
        qb.andWhere('asset.assetTag ILike :assetTag', {
          assetTag: `%${query.assetTag}%`,
        });
      }
      if (query.assetSn) {
        qb.andWhere('asset.serialNumber ILike :assetSn', {
          assetSn: `%${query.assetSn}%`,
        });
      }
    }

    if (query.category) {
      const categories = Array.isArray(query.category)
        ? query.category
        : [query.category];
      if (categories.length > 0) {
        qb.andWhere('category.name IN (:...category)', {
          category: categories,
        });
      }
    }

    if (query.employee) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('ticket.employeeNik ILike :employee', {
              employee: `%${query.employee}%`,
            })
            .orWhere('employee.name ILike :employee', {
              employee: `%${query.employee}%`,
            })
            .orWhere('CAST(ticket.snapshot AS text) ILike :employee', {
              employee: `%${query.employee}%`,
            });
        }),
      );
    } else {
      if (query.employeeNik) {
        qb.andWhere('ticket.employeeNik ILike :employeeNik', {
          employeeNik: `%${query.employeeNik}%`,
        });
      }
      if (query.employeeName) {
        qb.andWhere('employee.name ILike :employeeName', {
          employeeName: `%${query.employeeName}%`,
        });
      }
    }
    if (query.engineerName) {
      qb.andWhere('engineer.fullName ILike :engineerName', {
        engineerName: `%${query.engineerName}%`,
      });
    }
    if (query.createdByName) {
      qb.andWhere('createdBy.fullName ILike :createdByName', {
        createdByName: `%${query.createdByName}%`,
      });
    }
    if (query.contact) {
      qb.andWhere('ticket.contact ILike :contact', {
        contact: `%${query.contact}%`,
      });
    }
    if (query.approvedByName) {
      qb.andWhere('approvedBy.fullName ILike :approvedByName', {
        approvedByName: `%${query.approvedByName}%`,
      });
    }

    if (query.ticketNumber) {
      qb.andWhere('ticket.fullNumber ILike :ticketNumber', {
        ticketNumber: `%${query.ticketNumber}%`,
      });
    }
    if (query.location) {
      qb.andWhere('location.name ILike :location', {
        location: `%${query.location}%`,
      });
    }
    if (query.locationId !== undefined && query.locationId !== null) {
      const locationIds = Array.isArray(query.locationId)
        ? query.locationId.map(Number)
        : [Number(query.locationId)];
      const validLocationIds = locationIds.filter((id) => !isNaN(id));
      if (validLocationIds.length > 0) {
        qb.andWhere('ticket.locationId IN (:...locationIds)', {
          locationIds: validLocationIds,
        });
      }
    }
    if (query.problem) {
      qb.andWhere('ticket.problem ILike :problem', {
        problem: `%${query.problem}%`,
      });
    }
    if (query.solution) {
      qb.andWhere('ticket.solution ILike :solution', {
        solution: `%${query.solution}%`,
      });
    }
    if (query.startAt) {
      const dateStr = query.startAt.split('T')[0];
      qb.andWhere('DATE(ticket.startAt) = :startAtDate', {
        startAtDate: dateStr,
      });
    }
    if (query.solvedAt) {
      const dateStr = query.solvedAt.split('T')[0];
      qb.andWhere('DATE(ticket.solvedAt) = :solvedAtDate', {
        solvedAtDate: dateStr,
      });
    }
    if (query.status) {
      const statuses = Array.isArray(query.status)
        ? query.status
        : [query.status];
      qb.andWhere('ticket.status IN (:...status)', {
        status: statuses,
      });
    }

    if (query.hasBackupAsset || query.isNeedBackup) {
      qb.andWhere(
        "ticket.backupAssetTag IS NOT NULL AND ticket.backupAssetTag != ''",
      );
    }

    qb.addSelect(
      `CASE
          WHEN "slaPolicy"."priority" = 'high' THEN 1
          WHEN "slaPolicy"."priority" = 'medium' THEN 2
          WHEN "slaPolicy"."priority" = 'low' THEN 3
          ELSE 4
        END`,
      'priority_label',
    );

    if (user.role === Role.Engineer && forDashboard) {
      qb.andWhere(
        new Brackets((qbSub) => {
          qbSub
            .where('ticket.engineerId = :engineerId', { engineerId: user.sub })
            .orWhere('ticket.engineerId IS NULL');
        }),
      );
    }

    if (forDashboard) {
      qb.addSelect(
        `CASE
            WHEN ticket.status = 'open' THEN 1
            WHEN ticket.status = 'in progress' THEN 2
            ELSE 3
          END`,
        'status_label',
      );
      qb.addOrderBy('status_label', 'ASC');
      qb.addOrderBy('priority_label', 'ASC');
    } else {
      qb.addSelect(
        `CASE
            WHEN ticket.status = 'open' THEN 1
            ELSE 2
          END`,
        'status_label',
      );
      qb.addOrderBy('status_label', 'ASC');
    }

    qb.addSelect(
      "CAST(REGEXP_REPLACE(ticket.fullNumber, '[[:alpha:]]', '', 'g') AS INTEGER)",
      'extracted_number',
    );
    qb.addOrderBy('extracted_number', 'DESC');
    qb.addOrderBy('ticket.createdAt', 'DESC');
    const { data: tickets, meta } = await paginateQb(qb, query);

    return {
      data: plainToInstance(TicketResponseDto, tickets),
      meta,
    };
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        asset: {
          category: true,
          project: {
            vendor: true,
          },
          assetAssignments: {
            employee: true,
          },
        },
        createdBy: true,
        engineer: true,
        approvedBy: true,
        employee: {
          workLocation: true,
        },
        location: true,
        slaPolicy: true,
      },
      withDeleted: true,
    });
    if (!ticket) throw new NotFoundException('ticket not found');
    // if (
    //   user &&
    //   user.role === Role.Engineer &&
    //   ticket.engineerId !== null &&
    //   ticket.engineerId !== user.sub
    // ) {
    //   throw new ForbiddenException('you cant access this resource');
    // }
    return plainToInstance(TicketResponseDto, ticket);
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) throw new NotFoundException('ticket not found');

    if (dto.status === TicketStatus.Cancelled) {
      dto.solvedAt = new Date();
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        if (dto.backupAssetTag && ticket.assetTag && ticket.engineerId) {
          Logger.log(dto.backupAssetTag, 'backupAssetTag');
          dto.assignmentType = AssignmentType.Backup;
          dto.isAssetAssignment = true;
          await this.assetAssignmentService.create(
            {
              assetTag: dto.backupAssetTag,
              picEmployeeNik: ticket.employeeNik,
              userNonEmployeeName: ticket.snapshot?.userNonEmployee,
              assignedAt: new Date(),
              assignById: ticket.engineerId,
              isBackup: true,
              contact: ticket.contact,
              assignRemarks: `Backup for ${ticket.assetTag}`,
            },
            ticket.createdByUserId,
            manager,
          );

          const assignment =
            await this.assetAssignmentService.findLatestByAssetTag(
              ticket.assetTag,
              manager,
            );

          await this.assetAssignmentService.update(
            assignment.id,
            { isUnderMaintenance: true },
            manager,
          );
        }

        manager.merge(Ticket, ticket, dto);
        return await manager.save(Ticket, ticket);
      });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('server is busy');
    }
  }

  async getTicketTrend(range: TrendRange = TrendRange.MONTH) {
    const now = new Date();
    const startDate = new Date();

    //startDate
    if (range === TrendRange.WEEK) {
      startDate.setDate(now.getDate() - 7);
    } else if (range === TrendRange.YEAR) {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    const tickets = await this.ticketRepository.find({
      where: {
        createdAt: Between(startDate, now),
      },
      select: ['id', 'createdAt'],
      order: {
        createdAt: 'ASC',
      },
    });

    return this.groupTicketsByRange(tickets, range);
  }

  private groupTicketsByRange(tickets: Ticket[], range: TrendRange) {
    const trendMap = new Map<string, number>();

    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt);
      let label = '';

      if (range === TrendRange.YEAR) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        label = `${date.getFullYear()}-${month}`;
      } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        label = `${date.getFullYear()}-${month}-${day}`;
      }

      const currentCount = trendMap.get(label) || 0;
      trendMap.set(label, currentCount + 1);
    });

    return Array.from(trendMap.entries()).map(([label, count]) => ({
      label,
      count,
    }));
  }

  async getCountByStatus(user: JwtPayload) {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.engineer', 'engineer');

    if (user.role === Role.Engineer) {
      query.where('ticket.engineerId = :engineerId', { engineerId: user.sub });
    }

    const rawResults: {
      count: string;
      status: TicketStatus;
      engineerId: string | null;
      engineerName: string | null;
    }[] = await query
      .select('ticket.status', 'status')
      .addSelect('ticket.engineerId', 'engineerId')
      .addSelect('engineer.fullName', 'engineerName')
      .addSelect('COUNT(ticket.id)', 'count')
      .groupBy('ticket.status')
      .addGroupBy('ticket.engineerId')
      .addGroupBy('engineer.fullName')
      .getRawMany();

    const counts = {
      total: 0,
      open: 0,
      pending: 0,
      inProgress: 0,
      closedRemote: 0,
      closedVisit: 0,
      closedOnsite: 0,
      resolved: 0,
      cancelled: 0,
    };

    type EngineerCount = {
      engineerId: number | null;
      engineerName: string;
      count: number;
    };

    const byEngineer: Record<string, EngineerCount[]> = {
      total: [],
      open: [],
      pending: [],
      inProgress: [],
      closedRemote: [],
      closedVisit: [],
      closedOnsite: [],
      resolved: [],
      cancelled: [],
    };

    const totalEngineerMap = new Map<string, EngineerCount>();

    rawResults.forEach((row) => {
      const count = parseInt(row.count, 10);
      const status = row.status;
      const engineerId = row.engineerId ? Number(row.engineerId) : null;
      const engineerName = row.engineerName || 'Unassigned';

      counts.total += count;

      switch (row.status) {
        case TicketStatus.Open:
          counts.open += count;
          break;
        case TicketStatus.Pending:
          counts.pending += count;
          break;
        case TicketStatus.InProgress:
          counts.inProgress += count;
          break;
        case TicketStatus.ClosedRemote:
          counts.closedRemote += count;
          break;
        case TicketStatus.ClosedVisit:
          counts.closedVisit += count;
          break;
        case TicketStatus.ClosedOnsite:
          counts.closedOnsite += count;
          break;
        case TicketStatus.Resolved:
          counts.resolved += count;
          break;
        case TicketStatus.Cancelled:
          counts.cancelled += count;
          break;
      }

      let keyInByEngineer = status as string;
      if (status === TicketStatus.ClosedRemote)
        keyInByEngineer = 'closedRemote';
      else if (status === TicketStatus.ClosedVisit)
        keyInByEngineer = 'closedVisit';
      else if (status === TicketStatus.ClosedOnsite)
        keyInByEngineer = 'closedOnsite';
      else if (status === TicketStatus.InProgress)
        keyInByEngineer = 'inProgress';

      if (!byEngineer[keyInByEngineer]) {
        byEngineer[keyInByEngineer] = [];
      }
      byEngineer[keyInByEngineer].push({ engineerId, engineerName, count });

      const mapKey = engineerId ? `id_${engineerId}` : 'unassigned';
      if (!totalEngineerMap.has(mapKey)) {
        totalEngineerMap.set(mapKey, { engineerId, engineerName, count: 0 });
      }
      totalEngineerMap.get(mapKey)!.count += count;
    });

    byEngineer.total = Array.from(totalEngineerMap.values());

    return {
      ...counts,
      byEngineer,
    };
  }

  async hardRemove(id: number) {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) throw new NotFoundException('ticket not found');
    return await this.ticketRepository.remove(ticket);
  }

  async generatePdf(ticketId: number, dto?: CreateTicketPdfDto) {
    const ticket = await this.findOne(ticketId);
    const fbSupervisor =
      await this.userService.findFallBackSupervisorByLocation(
        ticket.location.id,
      );
    const supervisorId =
      ticket.approvedBy?.id || dto?.supervisorId || fbSupervisor.id;
    const supervisor = supervisorId
      ? await this.userService.findOne(supervisorId)
      : undefined;
    const engineer = ticket.engineer?.id
      ? await this.userService.findOne(ticket.engineer?.id)
      : undefined;

    const getTargetTemplateType = () => {
      if (ticket.isAssetAssignment) {
        if (ticket.assignmentType === AssignmentType.Backup) {
          return TemplateType.BastBackup;
        }
        if (ticket.assignmentType === AssignmentType.Return) {
          return TemplateType.BastReturn;
        }
        return TemplateType.BastAssign;
      }
      return TemplateType.Ticket;
    };

    const targetType = getTargetTemplateType();
    const template = await this.templateService.findByType(targetType);
    const absoluteTemplatePath = path.join(process.cwd(), template.filePath);
    if (!fs.existsSync(absoluteTemplatePath)) {
      throw new NotFoundException(
        `File template not found at path: ${template.filePath}`,
      );
    }

    try {
      const templateBuffer = fs.readFileSync(absoluteTemplatePath);
      const spvSignatureBuffer = getSignatureBuffer(
        dto?.eSignSupervisor ? supervisor?.signaturePath : null,
      );
      const engSignatureBuffer = getSignatureBuffer(
        dto?.eSignEngineer ? engineer?.signaturePath : null,
      );
      const userSignatureBuffer = getSignatureBuffer(
        dto?.eSignUser ? ticket.userSignaturePath : null,
      );

      const data = {
        ticketNumber: ticket.fullNumber || '-',
        problem: ticket.problem || '-',
        solution: ticket.solution || '-',
        phoneNumber: ticket.contact || '-',

        createdAtDate: ticket.createdAt
          ? formatTicketDateTime(ticket.createdAt).date
          : '-',
        startAtDate: ticket.startAt
          ? formatTicketDateTime(ticket.startAt).date
          : '-',
        solvedAtDate: ticket.solvedAt
          ? formatTicketDateTime(ticket.solvedAt).date
          : '-',

        createdAtTime: ticket.createdAt
          ? formatTicketDateTime(ticket.createdAt).time
          : '-',
        startAtTime: ticket.startAt
          ? formatTicketDateTime(ticket.startAt).time
          : '-',
        solvedAtTime: ticket.solvedAt
          ? formatTicketDateTime(ticket.solvedAt).time
          : '-',

        userNonEmployeeName: ticket.snapshot?.userNonEmployee || '-',
        user: ticket.snapshot?.userNonEmployee || 'Penanggung Jawab',
        engineerName: ticket.engineer?.fullName || '-',

        employeeName: ticket.employee?.name || '-',
        employeeNik: ticket.employee?.nik || '-',
        employeePosition:
          ticket.snapshot?.position || ticket.employee?.position || '-',
        employeeDepartment:
          ticket.snapshot?.department || ticket.employee?.department || '-',

        spvNik: supervisor?.nik || '-',
        spvName: supervisor?.fullName || '-',

        workLocation:
          ticket.location?.name || ticket.employee?.workLocation?.name || '-',

        assetName: ticket.asset ? ticket.asset.type : '-',
        assetTag: ticket.asset?.assetTag || '-',
        assetCategory: (ticket.asset?.category?.name || '-').toUpperCase(),
        assetSerialNumber: ticket.asset?.serialNumber || '-',

        vendorName: ticket.asset?.project?.vendor?.name || '-',
        projectName: ticket.asset?.project?.name || '-',

        remarks: ticket.remarks || '-',
        date: ticket.solvedAt
          ? formatTicketDateTime(ticket.solvedAt).date
          : ticket.createdAt
            ? formatTicketDateTime(ticket.createdAt).date
            : '-',
        supportSn: ticket.asset?.support?.sn || '-',
        oldAsset: ticket.backupAssetTag || '-',
        extTicketNumber: '-',
        extTicketDamageDescription: '-',
      };

      const report = await createReport({
        template: templateBuffer,
        data,
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
          spvSignature: () => {
            return {
              width: 4,
              height: 1.8,
              data: spvSignatureBuffer.data,
              extension: spvSignatureBuffer.extension,
            };
          },
          engSignature: () => {
            return {
              width: 4,
              height: 1.8,
              data: engSignatureBuffer.data,
              extension: engSignatureBuffer.extension,
            };
          },
          userSignature: () => {
            return {
              width: 4,
              height: 1.8,
              data: userSignatureBuffer.data,
              extension: userSignatureBuffer.extension,
            };
          },
        },
      });
      const buffer = Buffer.from(report);

      libre.convertAsync = promisify(libre.convert);
      const pdfBuffer: Buffer = await libre.convertAsync(
        buffer,
        '.pdf',
        undefined,
      );

      if (dto?.eSignEngineer && dto?.eSignSupervisor && dto?.eSignUser) {
        const ticketEntity = await this.ticketRepository.findOneBy({
          id: ticketId,
        });
        if (ticketEntity) {
          if (ticketEntity.isAssetAssignment) {
            const dir = path.join('storages', 'asset_assignments');
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            if (ticketEntity.filePath && fs.existsSync(ticketEntity.filePath)) {
              fs.unlink(ticketEntity.filePath, () => {});
            }

            const typeName =
              ticketEntity.assignmentType === AssignmentType.Backup
                ? 'backup'
                : ticketEntity.assignmentType === AssignmentType.Return
                  ? 'return'
                  : 'assign';
            const nik = ticketEntity.employeeNik || 'NIK';
            const assetTag = ticketEntity.assetTag || 'TAG';
            const uniqueSuffix = `${dayjs(Date.now()).format('YYYYMMMDD')}-${Math.round(Math.random() * 1000)}`;
            const fileName = `${typeName}-${assetTag}-${nik}-${uniqueSuffix}.pdf`;
            const filePath = path.join(dir, fileName);

            fs.writeFileSync(filePath, pdfBuffer);
            ticketEntity.filePath = filePath;
            await this.ticketRepository.save(ticketEntity);

            if (ticketEntity.fullNumber) {
              const matchingAssignment =
                await this.assetAssignmentService.findByTicketFullNumber(
                  ticketEntity.fullNumber,
                );
              if (matchingAssignment) {
                const isReturn =
                  matchingAssignment.returnFullTicketNumber ===
                    ticketEntity.fullNumber ||
                  ticketEntity.assignmentType === AssignmentType.Return;
                const fieldName = isReturn
                  ? 'returnFilePath'
                  : 'assignFilePath';
                const oldAssPath = matchingAssignment[fieldName];
                if (oldAssPath && fs.existsSync(oldAssPath)) {
                  fs.unlink(oldAssPath, () => {});
                }
                await this.assetAssignmentService.updateFilePath(
                  matchingAssignment.id,
                  fieldName,
                  filePath,
                );
              }
            }
          } else {
            const dir = path.join('storages', 'tickets');
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            if (ticketEntity.filePath && fs.existsSync(ticketEntity.filePath)) {
              fs.unlink(ticketEntity.filePath, () => {});
            }

            const uniqueSuffix = `${dayjs(Date.now()).format('YYYYMMMDD')}-${Math.round(Math.random() * 1000)}`;
            const fileName = `ticket-${ticket.fullNumber}-${uniqueSuffix}.pdf`;
            const filePath = path.join(dir, fileName);

            fs.writeFileSync(filePath, pdfBuffer);

            ticketEntity.filePath = filePath;
            await this.ticketRepository.save(ticketEntity);
          }
        }
      }

      return pdfBuffer;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async uploadUserSignature(ticketId: number, file: Express.Multer.File) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: {
        assignAssignment: true,
        returnAssignment: true,
      },
    });

    const assignment = () => {
      if (ticket?.isAssetAssignment) {
        if (
          ticket.assignmentType === AssignmentType.Assign ||
          ticket.assignmentType === AssignmentType.BackupAssign
        ) {
          return ticket.assignAssignment;
        }

        if (
          ticket.assignmentType === AssignmentType.Return ||
          ticket.assignmentType === AssignmentType.BackupReturn
        ) {
          return ticket.returnAssignment;
        }
      }
      return null;
    };

    const assignmentId = assignment()?.id;
    if (assignmentId && ticket?.assignmentType) {
      await this.assetAssignmentService.uploadUserSignature(
        assignmentId,
        file,
        ticket?.assignmentType,
        true,
      );
    }

    if (!ticket) {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {});
      }
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }
    if (ticket.userSignaturePath && fs.existsSync(ticket.userSignaturePath)) {
      fs.unlink(ticket.userSignaturePath, () => {});
    }

    ticket.userSignaturePath = file.path;
    await this.ticketRepository.save(ticket);
    return {
      id: ticket.id,
      userSignaturePath: ticket.userSignaturePath,
    };
  }

  async getUserSignatureStream(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (
      !ticket ||
      !ticket.userSignaturePath ||
      !fs.existsSync(ticket.userSignaturePath)
    ) {
      throw new NotFoundException(
        `User signature for ticket ${ticketId} not found`,
      );
    }
    return fs.createReadStream(ticket.userSignaturePath);
  }

  async approveTicket(ticketId: number, supervisorId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }

    const supervisor = await this.userService.findOne(supervisorId);
    if (!supervisor) {
      throw new NotFoundException(
        `Supervisor with id ${supervisorId} not found`,
      );
    }

    ticket.approvedById = supervisorId;
    await this.ticketRepository.save(ticket);
    return {
      id: ticket.id,
      approvedById: ticket.approvedById,
      message: 'Ticket approved successfully',
    };
  }

  async uploadTicketPdf(ticketId: number, file: Express.Multer.File) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, () => {});
      }
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }

    const dir = path.join('storages', 'tickets');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const uniqueSuffix = `${dayjs(Date.now()).format('YYYYMMMDD')}-${Math.round(Math.random() * 1000)}`;
    const fileName = `ticket-${ticket.fullNumber || ticket.id}-${uniqueSuffix}${path.extname(file.originalname) || '.pdf'}`;
    const newPath = path.join(dir, fileName);

    if (fs.existsSync(file.path)) {
      fs.renameSync(file.path, newPath);
    }

    if (
      ticket.filePath &&
      ticket.filePath !== newPath &&
      fs.existsSync(ticket.filePath)
    ) {
      fs.unlink(ticket.filePath, () => {});
    }

    ticket.filePath = newPath;
    await this.ticketRepository.save(ticket);
    return {
      id: ticket.id,
      filePath: ticket.filePath,
    };
  }

  async deleteTicketPdf(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${ticketId} not found`);
    }

    if (ticket.filePath && fs.existsSync(ticket.filePath)) {
      fs.unlink(ticket.filePath, () => {});
    }

    ticket.filePath = null;
    await this.ticketRepository.save(ticket);

    return {
      id: ticket.id,
      message: 'Ticket PDF deleted successfully',
    };
  }

  async getTicketStream(id: number): Promise<ReadStream> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket || !ticket.filePath) {
      throw new NotFoundException('file not found');
    }
    const fullPath = join(process.cwd(), ticket.filePath);

    if (!existsSync(fullPath)) {
      throw new NotFoundException('file not found');
    }
    return createReadStream(fullPath);
  }

  async importExcel(buffer: Buffer, creatorId: number) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const records: RawTicketExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: undefined,
      });

      if (!records || !records.length) {
        throw new BadRequestException('Excel file is empty');
      }

      const workLocations = await this.workLocationsService.findAll();
      const users = await this.userService.findAll();
      const defaultSla = await this.slaPolicyService.findDefault();

      return await this.ticketRepository.manager.transaction(
        async (manager) => {
          const ticketsToSave: Ticket[] = [];

          for (const row of records) {
            const seqNum =
              row.no !== undefined && row.no !== '' && !isNaN(Number(row.no))
                ? Number(row.no)
                : undefined;
            const fullNum = row.no ? row.no.toString().trim() : undefined;

            const nikStr = row.nik ? row.nik.toString().trim() : undefined;
            let employee: Employee | null = null;
            if (nikStr) {
              employee = await manager.findOne(Employee, {
                where: { nik: nikStr },
              });
            }

            const picVal = row.pic ? row.pic.toString().trim() : undefined;
            const positionVal = row.position
              ? row.position.toString().trim()
              : row.directorate
                ? row.directorate.toString().trim()
                : undefined;
            const deptVal = row.department
              ? row.department.toString().trim()
              : undefined;
            const divVal = row.division
              ? row.division.toString().trim()
              : undefined;

            const snapshot: TicketSnapshot = {
              userNonEmployee: picVal || undefined,
              position: positionVal || employee?.position,
              department: deptVal || employee?.department,
              division: divVal || employee?.division,
            };

            let locationId: number | undefined = undefined;
            if (row.lokasi) {
              const locStr = row.lokasi.toString().toLowerCase().trim();
              const foundLoc = workLocations.find(
                (l) => l.name.toLowerCase().trim() === locStr,
              );
              if (foundLoc) {
                locationId = foundLoc.id;
              }
            }

            let engineerId: number | undefined = undefined;
            if (row.engineer) {
              const engStr = row.engineer.toString().toLowerCase().trim();
              const foundEng = users.find(
                (u) => u.username.toLowerCase().trim() === engStr,
              );
              if (foundEng) {
                engineerId = foundEng.id;
              }
            }

            const startAt = parseExcelDateTime(row.waktu_mulai);
            const solvedAt = parseExcelDateTime(row.waktu_selesai);
            const createdAt = startAt
              ? new Date(startAt.getTime() - 60 * 1000)
              : new Date();

            let statusVal: TicketStatus = TicketStatus.Open;
            if (row.status) {
              const s = row.status.toString().toLowerCase().trim();
              if (Object.values(TicketStatus).includes(s as TicketStatus)) {
                statusVal = s as TicketStatus;
              }
            }

            let slaPolicyId = defaultSla.id;
            if (
              row.sla_id !== undefined &&
              row.sla_id !== '' &&
              !isNaN(Number(row.sla_id))
            ) {
              slaPolicyId = Number(row.sla_id);
            }

            const newTicket = manager.create(Ticket, {
              sequenceNumber: seqNum,
              fullNumber: fullNum || (seqNum ? `${seqNum}` : undefined),
              assetTag: row.assettag
                ? row.assettag.toString().trim()
                : undefined,
              employeeNik: nikStr,
              snapshot,
              engineerId,
              createdByUserId: creatorId,
              problem: row.permasalahan
                ? row.permasalahan.toString().trim()
                : '',
              slaPolicyId,
              locationId,
              status: statusVal,
              solution: row.penyelesaian
                ? row.penyelesaian.toString().trim()
                : undefined,
              contact: row.contact ? row.contact.toString().trim() : undefined,
              remarks: row.remarks ? row.remarks.toString().trim() : undefined,
              startAt,
              solvedAt,
              createdAt,
            });

            ticketsToSave.push(newTicket);
          }

          const chunkSize = 50;
          for (let i = 0; i < ticketsToSave.length; i += chunkSize) {
            const chunk = ticketsToSave.slice(i, i + chunkSize);
            await manager.upsert(Ticket, chunk, {
              conflictPaths: ['fullNumber'],
              skipUpdateIfNoValuesChanged: true,
              upsertType: 'on-conflict-do-update',
            });
          }

          return {
            message: `Successfully imported ${ticketsToSave.length} tickets`,
            count: ticketsToSave.length,
          };
        },
      );
    } catch (error: any) {
      Logger.error('Error importing tickets from excel:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        error?.detail ||
          error?.message ||
          'Failed to import tickets from excel',
      );
    }
  }
}

function parseExcelDateTime(val: any): Date | undefined {
  if (!val || val === '') return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    return new Date(Math.round((val - 25569) * 86400 * 1000));
  }
  const str = String(val).trim();
  if (!str) return undefined;

  const ddmmyyyyRegex =
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  const match = str.match(ddmmyyyyRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hours = match[4] ? parseInt(match[4], 10) : 0;
    const minutes = match[5] ? parseInt(match[5], 10) : 0;
    const seconds = match[6] ? parseInt(match[6], 10) : 0;
    return new Date(year, month, day, hours, minutes, seconds);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}
