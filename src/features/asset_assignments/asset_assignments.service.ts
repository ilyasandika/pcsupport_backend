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
import { CreateAssetAssignmentDto } from './dto/create-asset_assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset_assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetAssignment } from './entities/asset_assignment.entity';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { EmployeesService } from '../employees/employees.service';
import { AssetsService } from '../assets/assets.service';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';
import { ReturnAssetAssignmentDto } from './dto/return-asset_assignment.dto';
import { TemplateType } from '../templates/entities/template.entity';
import dayjs from 'dayjs';
import path from 'node:path';
import fs from 'node:fs/promises';
import { formatTicketDateTime, getSignatureBuffer } from '../../helper';
import { TemplatesService } from '../templates/templates.service';
import { plainToInstance } from 'class-transformer';
import { DetailAssetAssignmentResponseDto } from './dto/asset_assignment-response.dto';
import { CreateAssignmentPdfDto } from './dto/create-asset_assignment-pdf.dto';
import { createReadStream, existsSync, ReadStream } from 'node:fs';
import { extname, join } from 'path';
import { ASSET_ASSIGNMENT_UPLOAD_DIR } from '../../common/const/directory.const';
import { promisify } from 'util';
import libre from 'libreoffice-convert';
import createReport from 'docx-templates';
import { UsersService } from '../users/users.service';
import { Asset, AssetStatus } from '../assets/entities/asset.entity';
import { TicketsService } from '../tickets/tickets.service';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { AssignmentType } from '../../common/enums/assignment-type.enum';
import { Ticket } from '../tickets/entities/ticket.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import * as XLSX from 'xlsx';
import { RawAssignmentExcelRow } from '../../common/interfaces/raw-assignment-excel.interfafce';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class AssetAssignmentsService {
  constructor(
    @InjectRepository(AssetAssignment)
    private readonly assetAssignmentRepository: Repository<AssetAssignment>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly employeeService: EmployeesService,
    private readonly assetService: AssetsService,
    private readonly templateService: TemplatesService,
    private readonly userService: UsersService,

    @Inject(forwardRef(() => TicketsService))
    private readonly ticketService: TicketsService,
    private dataSource: DataSource,
  ) { }

  async create(
    dto: CreateAssetAssignmentDto,
    creatorId: number,
    externalManager?: EntityManager,
  ) {
    const manager = externalManager;
    const assignmentRepo = manager
      ? manager.getRepository(AssetAssignment)
      : this.assetAssignmentRepository;

    const lastUse = await assignmentRepo.findOne({
      where: {
        assetTag: dto.assetTag,
        returnedAt: IsNull(),
      },
    });

    if (lastUse) {
      if (new Date(dto.assignedAt) > new Date(lastUse?.assignedAt)) {
        throw new BadRequestException(
          ErrorDetailBuilder.buildOne(
            'assign date cannot overlap current assignment date',
            'assignedAt',
          ),
        );
      }
    }

    if (!dto.isLegacyData && lastUse) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne('asset is currently use', 'assetId'),
      );
    }

    // A <= D && B>=C
    // A = Assign Baru
    // D = Return Lama
    // B = Return Baru
    // C = Assign Lama
    const overlappingAssignment = await assignmentRepo.findOne({
      where: {
        assetTag: dto.assetTag,
        assignedAt: LessThanOrEqual(
          dto.returnedAt ? new Date(dto.returnedAt) : new Date('9999-12-31'),
        ),
        returnedAt: MoreThanOrEqual(new Date(dto.assignedAt)),
      },
    });

    if (overlappingAssignment) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          `Assignment timeline overlap detected. During this period, the asset is already actively assigned to another user.`,
          'assignedAt',
        ),
      );
    }

    const employee = await this.employeeService.findOne(
      dto.picEmployeeNik,
      manager,
    );
    if (!employee) throw new NotFoundException('employee not found');

    const asset = await this.assetService.findOne(
      dto.assetTag,
      undefined,
      manager,
    );
    if (!asset) throw new NotFoundException('asset not found');

    const executeOperation = async (manager: EntityManager) => {
      if (asset.status === AssetStatus.Backup) {
        Logger.log('[Assigment] asset status is backup');
        await this.assetService.update(
          asset.assetTag,
          { status: AssetStatus.AssignedForBackup },
          manager,
          true,
        );
      } else {
        Logger.log('[Assigment] asset status is not backup');
        await this.assetService.update(
          asset.assetTag,
          { status: AssetStatus.Assigned },
          manager,
          true,
        );
      }
      Logger.log(
        '[Assigment] end update backup asset status to assigned for backup',
      );
      let createdTicket: Ticket | undefined = undefined;
      if (!externalManager) {
        createdTicket = await this.ticketService.create(
          {
            assetTag: asset.assetTag,
            employeeNik: employee.nik,
            engineerId: dto.assignById,
            problem: `Deploy Asset ${asset.assetTag}`,
            locationId: employee.workLocation.id,
            solution: `Deploy Asset ${asset.assetTag}`,
            userNonEmployeeName: dto.userNonEmployeeName,
            contact: dto.contact,
            remarks: dto.assignRemarks,
            solvedAt: new Date(dto.assignedAt),
            status: TicketStatus.ClosedOnsite,
            isAssetAssignment: true,
            assignmentType: dto.isBackup ? AssignmentType.Backup : AssignmentType.Assign,
          },
          creatorId,
          manager,
        );
      }
      Logger.log('[Assigment] start create assigment');
      const assignment = manager.create(AssetAssignment, dto);
      if (createdTicket?.fullNumber) {
        assignment.assignFullTicketNumber = createdTicket.fullNumber;
      }
      Logger.log('[Assigment] end create assigment');
      assignment.createdById = creatorId;
      Logger.log('[Assigment] start save assigment', assignment);
      try {
        return await manager.save(assignment);
      } catch (error) {
        Logger.error(`[Assigment] error save assigment: ${error}`);
        throw new InternalServerErrorException(
          'Failed to create asset assignment',
        );
      }
    };

    if (externalManager) {
      Logger.log('[Assigment] start save assigment 2'); ``
      return await executeOperation(externalManager);
    } else {
      return await this.dataSource.transaction(async (manager) => {
        return await executeOperation(manager);
      });
    }
  }

  async findAllByAssetTag(assetTag: string) {
    return await this.assetAssignmentRepository.find({
      where: {
        assetTag,
      },
      order: {
        assignedAt: 'DESC',
      },
      relations: {
        employee: true,
        asset: true,
      },
    });
  }

  async findAllByEmployeeNik(employeeNik: string) {
    return await this.assetAssignmentRepository.find({
      where: { picEmployeeNik: employeeNik },
      order: {
        assignedAt: 'DESC',
      },
      relations: {
        employee: true,
        asset: true,
      },
    });
  }

  async findLatestByAssetTag(assetTag: string, manager?: EntityManager) {
    try {
      const repo = manager
        ? manager.getRepository(AssetAssignment)
        : this.assetAssignmentRepository;
      return await repo.findOneOrFail({
        where: { assetTag },
        order: {
          assignedAt: 'DESC',
        },
      });
    } catch {
      throw new NotFoundException('assignment not fount');
    }
  }

  async findOne(id: number) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        assignBy: true,
        returnBy: true,
        assignTicket: {
          approvedBy: true,
        },
        returnTicket: {
          approvedBy: true,
        },
        employee: {
          workLocation: true,
        },
        asset: {
          project: {
            vendor: true,
          },
          category: true,
        },
      },
    });
    if (!assignment) throw new NotFoundException('assignment not found');
    return plainToInstance(DetailAssetAssignmentResponseDto, assignment);
  }

  async update(
    id: number,
    dto: UpdateAssetAssignmentDto,
    externalManager?: EntityManager,
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id },
      relations: { asset: true, employee: true },
    });
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }

    const wasReturned = !!assignment.returnedAt;

    this.assetAssignmentRepository.merge(assignment, dto);

    if (dto.returnedAt === null) {
      assignment.returnedAt = null;
    }
    if (dto.returnRemarks === null) {
      assignment.returnRemarks = "";
    }

    const isReturned = !!assignment.returnedAt;

    const executeOperation = async (manager: EntityManager) => {
      const savedAssignment = await manager.save(assignment);

      if (wasReturned && !isReturned && assignment.asset) {
        const newStatus = assignment.isBackup
          ? AssetStatus.AssignedForBackup
          : AssetStatus.Assigned;
        await this.assetService.update(
          assignment.asset.assetTag,
          { status: newStatus },
          manager,
          true,
        );
      } else if (!wasReturned && isReturned && assignment.asset) {
        await this.assetService.update(
          assignment.asset.assetTag,
          { status: AssetStatus.Returned },
          manager,
          true,
        );
      }

      return savedAssignment;
    };

    if (externalManager) {
      return await executeOperation(externalManager);
    } else {
      return await this.dataSource.transaction(async (manager) => {
        return await executeOperation(manager);
      });
    }
  }

  async returnAssignment(
    id: number,
    dto: ReturnAssetAssignmentDto,
    user: JwtPayload,
    externalManager?: EntityManager,
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id },
      relations: {
        employee: {
          workLocation: true,
        },
        asset: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          'this assignment has already been returned',
          'id',
        ),
      );
    }

    if (new Date(dto.returnedAt) < new Date(assignment.assignedAt)) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          'return date must be after or equal to assign date',
          'returnedAt',
        ),
      );
    }

    assignment.returnedAt = new Date(dto.returnedAt);
    assignment.returnById = dto.engineerId;

    if (dto.remarks !== undefined) {
      assignment.returnRemarks = dto.remarks;
    }

    return await this.dataSource.transaction(async (manager) => {
      const savedAssignment = await manager.save(assignment);
      Logger.log('masuk assignment');

      let problem: string = `Penarikan Asset ${assignment.asset.assetTag}`;
      let solution: string = `Penarikan Asset ${assignment.asset.assetTag}`;

      await this.assetService.update(
        assignment.asset.assetTag,
        { status: AssetStatus.Returned },
        manager,
        true,
      );

      if (assignment.isBackup && assignment.backupForAssetTag) {
        const backupAssignment = await this.assetAssignmentRepository.findOne({
          where: { assetTag: assignment.backupForAssetTag },
        });

        if (backupAssignment) {
          await this.update(
            backupAssignment.id,
            { isUnderMaintenance: false },
            manager,
          );
          problem = `Penarikan Asset ${assignment.asset.assetTag} \n Deploy kembali Asset ${assignment.backupForAssetTag}`;
          solution = `Penarikan Asset ${assignment.asset.assetTag} \n Deploy kembali Asset ${assignment.backupForAssetTag}`;
        }
      }

      const returnTicket = await this.ticketService.create(
        {
          assetTag: assignment.asset.assetTag,
          employeeNik: assignment.employee.nik,
          engineerId: dto.engineerId,
          problem: problem,
          locationId: assignment.employee.workLocation.id,
          solution: solution,
          userNonEmployeeName: assignment.userNonEmployeeName,
          contact: assignment.contact,
          remarks: dto.remarks,
          solvedAt: new Date(),
          status: TicketStatus.ClosedOnsite,
          isAssetAssignment: true,
          assignmentType: AssignmentType.Return,
        },
        user.sub as number,
        manager,
      );

      if (returnTicket?.fullNumber) {
        savedAssignment.returnFullTicketNumber = returnTicket.fullNumber;
        await manager.save(savedAssignment);
      }

      return savedAssignment;
    });
  }

  async createBastFromTemplate(
    assetAssignmentId: number,
    dto: CreateAssignmentPdfDto,
    assignType: 'assign' | 'return' = 'assign',
  ) {
    const assignment = await this.findOne(assetAssignmentId);
    if (!assignment) {
      throw new NotFoundException(
        `Asset assignment with id ${assetAssignmentId} not found`,
      );
    }

    const templateType = () => {
      if (assignment.isBackup) return TemplateType.BastBackup;
      return assignType === 'assign'
        ? TemplateType.BastAssign
        : TemplateType.BastReturn;
    };

    const template = await this.templateService.findByType(templateType());
    if (!template || !template.filePath) {
      throw new NotFoundException(
        `Template for type ${templateType()} was not found in database`,
      );
    }
    const absoluteTemplatePath = path.join(process.cwd(), template.filePath);
    try {
      await fs.access(absoluteTemplatePath);
    } catch {
      throw new NotFoundException(
        `File template not found at path: ${template.filePath}`,
      );
    }

    const employeeNik = assignment.employee?.nik;
    const lastReturnedAssignment = await this.assetAssignmentRepository.findOne(
      {
        where: {
          picEmployeeNik: employeeNik,
          returnedAt: Not(IsNull()),
          assignedAt: LessThan(assignment.assignedAt),
        },
        relations: { asset: true },
        order: {
          returnedAt: 'DESC',
        },
      },
    );
    const oldAssetTag = lastReturnedAssignment?.asset?.assetTag || '-';

    const engineer =
      assignType === 'return'
        ? assignment.returnBy || assignment.assignBy
        : assignment.assignBy;

    const ticket =
      assignType === 'return'
        ? assignment.returnTicket || assignment.assignTicket
        : assignment.assignTicket || assignment.returnTicket;

    const supervisorId = ticket?.approvedBy?.id;
    const supervisor = ticket?.approvedBy || (supervisorId ? await this.userService.findOne(supervisorId) : undefined);

    try {
      const templateBuffer = await fs.readFile(absoluteTemplatePath);
      const userSigPath =
        assignType === 'return'
          ? assignment.returnUserSignaturePath
          : assignment.assignUserSignaturePath;

      const spvSignatureBuffer = getSignatureBuffer(
        dto?.eSignSupervisor ? supervisor?.signaturePath : null,
      );
      const engSignatureBuffer = getSignatureBuffer(
        dto?.eSignEngineer ? engineer?.signaturePath : null,
      );
      const userSignatureBuffer = getSignatureBuffer(
        dto?.eSignUser ? userSigPath : null,
      );

      const createdAtFormatted = assignment.createdAt
        ? formatTicketDateTime(assignment.createdAt)
        : null;

      const data = {
        createdAtDate: createdAtFormatted?.date || '-',
        createdAtTime: createdAtFormatted?.time || '-',

        spvName: supervisor?.fullName || '-',
        spvNik: supervisor?.nik || '-',

        employeeName: assignment.employee?.name || '-',
        employeeNik: assignment.employee?.nik || '-',
        employeePosition: assignment.employee?.position || '-',
        employeeDepartment: assignment.employee?.department || '-',

        user: assignment.userNonEmployeeName || 'Penanggung Jawab',

        workLocation: assignment.employee?.workLocation?.name || '-',

        assetName: assignment.asset ? assignment.asset.type : '-',
        assetTag: assignment.asset?.assetTag || '-',
        assetCategory: (assignment.asset?.category?.name || '-').toUpperCase(),
        assetSerialNumber: assignment.asset?.serialNumber || '-',

        vendorName: assignment.asset?.project?.vendor?.name || '-',
        projectName: assignment.asset?.project?.name || '-',

        remarks: (assignType === 'assign' ? assignment.assignRemarks : assignment.returnRemarks) || assignment.remarks || '-',
        phoneNumber: assignment.contact || '-',
        date: new Date(
          assignType === 'assign'
            ? assignment.assignedAt
            : assignment.returnedAt || Date.now(),
        ).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          hourCycle: 'h24',
          minute: '2-digit',
        }),
        engineerName: engineer?.fullName || '-',
        supportSn: assignment.asset?.support?.sn || '-',

        oldAsset: oldAssetTag,
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
        const assignmentEntity = await this.assetAssignmentRepository.findOne({
          where: { id: assetAssignmentId },
          relations: { employee: true, asset: true },
        });
        if (assignmentEntity) {
          const dir = path.join('storages', 'asset_assignments');
          if (!existsSync(dir)) {
            await fs.mkdir(dir, { recursive: true });
          }

          const typeName = assignmentEntity.isBackup ? 'backup' : assignType;
          const nik = assignmentEntity.employee?.nik || assignmentEntity.picEmployeeNik || 'NIK';
          const assetTag = assignmentEntity.asset?.assetTag || assignmentEntity.assetTag || 'TAG';
          const uniqueSuffix = `${dayjs(Date.now()).format('YYYYMMMDD')}-${Math.round(Math.random() * 1000)}`;
          const fileName = `${typeName}-${assetTag}-${nik}-${uniqueSuffix}.pdf`;
          const filePath = path.join(dir, fileName);

          const targetField = assignType === 'return' ? 'returnFilePath' : 'assignFilePath';
          const oldFilePath = assignmentEntity[targetField];

          if (oldFilePath && existsSync(oldFilePath)) {
            try {
              await fs.unlink(oldFilePath);
            } catch { }
          }

          await fs.writeFile(filePath, pdfBuffer);

          assignmentEntity[targetField] = filePath;
          await this.assetAssignmentRepository.save(assignmentEntity);
        }
      }

      return pdfBuffer;
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to generate BAST PDF: ${e}`,
      );
    }
  }

  async uploadAssetAssignmentPdf(
    assetAssignmentId: number,
    file: Express.Multer.File,
    type: 'assign' | 'return',
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id: assetAssignmentId },
      relations: {
        employee: true,
        asset: true,
      },
    });

    if (!assignment) {
      if (file?.path && existsSync(file.path)) {
        await fs.unlink(file.path);
      }
      throw new NotFoundException(
        `Asset assignment with id ${assetAssignmentId} not found`,
      );
    }

    const typeName = assignment.isBackup ? 'backup' : type;
    const nik = assignment.employee?.nik || assignment.picEmployeeNik || 'NIK';
    const assetTag = assignment.asset?.assetTag || assignment.assetTag || 'TAG';
    const uniqueSuffix = `${dayjs(Date.now()).format('YYYYMMMDD')}-${Math.round(Math.random() * 1000)}`;
    const fileExt = extname(file.originalname) || '.pdf';
    const newFilename = `${typeName}-${assetTag}-${nik}-${uniqueSuffix}${fileExt}`;
    const dir = path.join('storages', 'asset_assignments');
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    const newPath = join(dir, newFilename);

    try {
      await fs.rename(file.path, newPath);
    } catch (error) {
      if (existsSync(file.path)) {
        await fs.unlink(file.path);
      }
      throw new InternalServerErrorException(
        `Failed to upload file, please try again later, ${error}`,
      );
    }
    const targetPathKey =
      type === 'assign' ? 'assignFilePath' : 'returnFilePath';
    const oldFilePath = assignment[targetPathKey];

    if (oldFilePath && existsSync(oldFilePath)) {
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error(`Failed to delete old file at ${oldFilePath}:`, err);
      }
    }

    assignment[targetPathKey] = newPath;
    await this.assetAssignmentRepository.save(assignment);

    return {
      id: assignment.id,
      [targetPathKey]: assignment[targetPathKey],
    };
  }

  async uploadUserSignature(
    assetAssignmentId: number,
    file: Express.Multer.File,
    type: 'assign' | 'return' = 'assign',
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id: assetAssignmentId },
    });

    if (!assignment) {
      if (file?.path && existsSync(file.path)) {
        await fs.unlink(file.path);
      }
      throw new NotFoundException(
        `Asset assignment with id ${assetAssignmentId} not found`,
      );
    }

    const targetField =
      type === 'return'
        ? 'returnUserSignaturePath'
        : 'assignUserSignaturePath';

    const oldPath = assignment[targetField];
    if (oldPath && existsSync(oldPath)) {
      try {
        await fs.unlink(oldPath);
      } catch { }
    }

    assignment[targetField] = file.path;
    await this.assetAssignmentRepository.save(assignment);

    return {
      id: assignment.id,
      [targetField]: assignment[targetField],
    };
  }

  async getUserSignatureStream(
    assetAssignmentId: number,
    type: 'assign' | 'return' = 'assign',
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id: assetAssignmentId },
    });

    const targetField =
      type === 'return'
        ? 'returnUserSignaturePath'
        : 'assignUserSignaturePath';

    const sigPath = assignment ? assignment[targetField] : null;

    if (!assignment || !sigPath || !existsSync(sigPath)) {
      throw new NotFoundException(
        `User signature for asset assignment ${assetAssignmentId} (${type}) not found`,
      );
    }
    return createReadStream(sigPath);
  }

  async deleteAssetAssignmentPdf(
    assetAssignmentId: number,
    type: 'assign' | 'return' = 'assign',
  ) {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id: assetAssignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Asset assignment with id ${assetAssignmentId} not found`,
      );
    }

    const targetField =
      type === 'return' ? 'returnFilePath' : 'assignFilePath';
    const filePath = assignment[targetField];

    if (filePath && existsSync(filePath)) {
      try {
        await fs.unlink(filePath);
      } catch { }
    }

    assignment[targetField] = null;
    await this.assetAssignmentRepository.save(assignment);

    return {
      id: assignment.id,
      message: `Asset assignment PDF (${type}) deleted successfully`,
    };
  }

  async getAssetAssignmentStream(id: number): Promise<ReadStream> {
    const assignment = await this.assetAssignmentRepository.findOne({
      where: { id },
    });
    if (!assignment || !assignment.assignFilePath) {
      throw new NotFoundException('file not found');
    }
    const fullPath = join(process.cwd(), assignment.assignFilePath);

    if (!existsSync(fullPath)) {
      throw new NotFoundException('file not found');
    }
    return createReadStream(fullPath);
  }

  async parseExcel(buffer: Buffer, user: JwtPayload) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records: any[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: undefined,
    });

    const userList = await this.userService.findAll();

    const mappedData: CreateAssetAssignmentDto[] = records.flatMap(
      (row: RawAssignmentExcelRow) => {
        let userId: number;
        if (isNaN(Number(row['engineer']))) {
          const foundUser = userList.find(
            (u) =>
              u.username.toLowerCase() ===
              row['engineer'].toString().toLowerCase(),
          );
          if (foundUser) {
            userId = foundUser.id;
          } else {
            throw new NotFoundException(
              `${row['engineer']} not in engineer list`,
            );
          }
        } else {
          userId = Number(row['engineer']);
        }

        const date = dayjs(row['tanggal'] || undefined, 'DD/MM/YYYY');
        const isReturn = () => {
          if (row['progress'] === 'assigned') return false;
          if (row['progress'] === 'pending bast') return false;
          if (row['progress'] === 'returned') return true;
          if (row['progress'] === 'missing') return true;
          if (row['progress'] === 'offline') return true;
        };

        let updateUsers: string[] = [];

        if (row['remarks_update_user']) {
          updateUsers = row['remarks_update_user']
            .toString()
            .replace(/\s+/g, '')
            .split('to');
        }

        updateUsers = updateUsers.filter((user) => user !== '');

        if (!updateUsers.includes(row['nik'])) {
          updateUsers.push(row['nik']);
        }

        if (updateUsers && updateUsers.length > 1) {
          const results: CreateAssetAssignmentDto[] = [];

          for (let index = 0; index < updateUsers.length; index++) {
            const userItem = updateUsers[index];
            const isLast =
              userItem === row['nik'] || index === updateUsers.length - 1;

            const getReturnDate = () => {
              const returnDate = date
                .subtract(updateUsers.length - 1 - index, 'day')
                .add(1, 'hour')
                .toDate();

              if (!isLast) {
                return returnDate;
              } else if (isLast && isReturn()) {
                return returnDate;
              } else {
                return undefined;
              }
            };

            results.push({
              assetTag: row['assettag'],
              picEmployeeNik: userItem,
              userNonEmployeeName: row['pengguna'],
              assignedAt: date
                .subtract(updateUsers.length - 1 - index, 'day')
                .toDate(),
              isBackup: false,
              assignById: isLast
                ? userId
                : userList.find((v) => v.username.toLowerCase() === 'unknown')
                  ?.id,
              returnedAt: getReturnDate(),
              assignRemarks: row['remarks'],
              returnRemarks: row['remarks_penarikan'],
              legacyBastStatus: row['bast'],
              isLegacyData: true,
              createdById: user.sub as number,
            });

            if (isLast) break;
          }

          return results;
        } else {
          return {
            assetTag: row['assettag'],
            picEmployeeNik: row['nik'],
            userNonEmployeeName: row['pengguna'],
            assignedAt: dayjs(
              row['tanggal'] || undefined,
              'DD/MM/YYYY',
            ).toDate(),
            isBackup: false,
            assignById: userId,
            returnedAt: isReturn() ? date.add(1, 'hour').toDate() : undefined,
            assignRemarks: row['remarks'],
            returnRemarks: row['remarks_penarikan'],
            legacyBastStatus: row['bast'],
            isLegacyData: true,
            createdById: user.sub as number,
          };
        }
      },
    );

    return await this.bulkSave(mappedData);
  }

  private async bulkSave(dto: CreateAssetAssignmentDto[]) {
    try {
      const assetTags = dto.map((item) => item.assetTag);
      const userIds = dto.map((item) => item.picEmployeeNik);

      const validAssets = await this.assetRepository.find({
        where: { assetTag: In(assetTags) },
        select: ['assetTag'],
      });

      const validUsers = await this.employeeRepository.find({
        where: { nik: In(userIds) },
        select: ['nik'],
      });

      const validAssetTags = validAssets.map((asset) => asset.assetTag);
      const validUserIds = validUsers.map((user) => user.nik);

      const validDtos: CreateAssetAssignmentDto[] = [];

      const invalidDtos: any[] = [];

      const validAssetTagSet = new Set(validAssetTags);
      const validUserNikSet = new Set(validUserIds);
      const errorReasons: string[] = [];

      for (const item of dto) {
        const isAssetValid = validAssetTagSet.has(item.assetTag);
        const isUserValid = validUserNikSet.has(item.picEmployeeNik);
        if (isAssetValid && isUserValid) {
          validDtos.push(item);
        } else {
          if (!isAssetValid) {
            errorReasons.push(
              `Asset Tag '${item.assetTag}' tidak ditemukan di database`,
            );
          }
          if (!isUserValid) {
            errorReasons.push(
              `Employee NIK '${item.picEmployeeNik}' tidak ditemukan di database asset ${item.assetTag}`,
            );
          }

          invalidDtos.push({
            ...item,
            errorReason: errorReasons.join(' | '),
          });
        }
      }
      if (errorReasons.length > 0) {
        throw new BadRequestException(errorReasons);
      }

      // return await this.assetAssignmentRepository.insert(dto);
      await this.assetAssignmentRepository
        .createQueryBuilder()
        .insert()
        .into(AssetAssignment)
        .values(dto)
        .orIgnore()
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const assignment = await this.assetAssignmentRepository.findOne({
        where: { id },
        relations: { asset: true, assignTicket: true, returnTicket: true },
      });
      if (!assignment) {
        throw new NotFoundException('assignment not found');
      }
      return await this.dataSource.transaction(async (manager) => {
        if (!assignment.returnedAt && assignment.asset) {
          const newStatus = assignment.isBackup
            ? AssetStatus.Backup
            : AssetStatus.ReadyStock;
          await this.assetService.update(
            assignment.asset.assetTag,
            { status: newStatus },
            manager,
            true,
          );
        }

        if (assignment.assignFullTicketNumber) {
          await manager.update(
            Ticket,
            { fullNumber: assignment.assignFullTicketNumber },
            { status: TicketStatus.Cancelled },
          );
        }
        if (assignment.returnFullTicketNumber) {
          await manager.update(
            Ticket,
            { fullNumber: assignment.returnFullTicketNumber },
            { status: TicketStatus.Cancelled },
          );
        }
        if (
          !assignment.assignFullTicketNumber &&
          !assignment.returnFullTicketNumber &&
          assignment.assetTag
        ) {
          await manager.update(
            Ticket,
            {
              assetTag: assignment.assetTag,
              problem: `Deploy Asset ${assignment.assetTag}`,
            },
            { status: TicketStatus.Cancelled },
          );
        }

        await manager.remove(assignment);
        return { message: 'Assignment deleted successfully' };
      });
    } catch (error) {
      Logger.error(`Failed to remove asset assignment (ID: ${id}):`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove asset assignment: ${error?.message || error}`,
      );
    }
  }

  async findByTicketFullNumber(fullNumber: string): Promise<AssetAssignment | null> {
    return await this.assetAssignmentRepository.findOne({
      where: [
        { assignFullTicketNumber: fullNumber },
        { returnFullTicketNumber: fullNumber },
      ],
    });
  }

  async updateFilePath(id: number, field: 'assignFilePath' | 'returnFilePath', filePath: string) {
    await this.assetAssignmentRepository.update(id, { [field]: filePath });
  }
}
