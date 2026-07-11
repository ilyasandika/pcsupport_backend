import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Between, EntityManager, Repository } from 'typeorm';
import Mustache from 'mustache';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { AssetAssignmentsService } from '../asset_assignments/asset_assignments.service';
import { TrendRange } from '../../common/enums/common.enum';
import { plainToInstance } from 'class-transformer';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TemplatesService } from '../templates/templates.service';
import { TemplateType } from '../templates/entities/template.entity';
import path from 'node:path';
import * as fs from 'node:fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import libre from 'libreoffice-convert';
import { promisify } from 'node:util';
import { formatTicketDateTime } from '../../helper';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly assetAssignmentService: AssetAssignmentsService,
    private readonly templateService: TemplatesService,
  ) {}

  async create(dto: CreateTicketDto, creatorId: number) {
    try {
      return await this.ticketRepository.manager.transaction(
        async (manager) => {
          if (dto.assetSn) {
            const assetAssignment =
              await this.assetAssignmentService.findLatestByAssetSn(
                dto.assetSn,
                manager,
              );

            if (assetAssignment) {
              //dto employee id tidak sesuai dengan data kepemilikan asset dan belum dikembalikan
              if (
                dto.employeeNik &&
                assetAssignment.picEmployeeNik != dto.employeeNik &&
                !assetAssignment.returnedAt
              ) {
                throw new BadRequestException(
                  'the specified asset does not belong to this employee',
                );
              }

              //dto employee ada, asset sudah dikembalikan.
              if (dto.employeeNik && assetAssignment.returnedAt) {
                throw new BadRequestException(
                  'the specified asset has returned, employee id should empty',
                );
              }

              //dto employee id kosong dan asset belum dikembalikan.
              if (dto.employeeNik == undefined && !assetAssignment.returnedAt) {
                throw new BadRequestException('this asset still have an owner');
              }
            } else {
              if (dto.employeeNik) {
                throw new BadRequestException(
                  'this is new asset, please assign the asset first',
                );
              }
            }
          }

          const latestTicket = await manager.findOne(Ticket, {
            where: {},
            order: { sequenceNumber: 'DESC' },
            lock: { mode: 'pessimistic_write' },
          });
          const nextNumber: number = latestTicket
            ? latestTicket.sequenceNumber + 1
            : 1;

          const fullNumber = dto.engineerId
            ? await this.getFullNumber(manager, dto.fullNumberTemplate)
            : undefined;

          const newTicket = manager.create(Ticket, {
            ...dto,
            sequenceNumber: nextNumber,
            engineerId: dto.engineerId ?? undefined,
            createdByUserId: creatorId,
            status: dto.engineerId
              ? TicketStatus.InProgress
              : TicketStatus.Open,
            startAt: dto.engineerId ? new Date() : undefined,
            fullNumber,
          });

          const savedTicket = manager.create(Ticket, newTicket);
          return await manager.save(Ticket, savedTicket);
        },
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      Logger.error(e);
      throw new InternalServerErrorException('server is busy');
    }
  }

  async claimTicket(id: number, engineerId: number) {
    try {
      return await this.ticketRepository.manager.transaction(
        async (manager) => {
          const ticket = await manager.findOne(Ticket, {
            where: { id },
            order: { sequenceNumber: 'DESC' },
            lock: { mode: 'pessimistic_write' },
          });

          if (ticket?.engineerId)
            throw new BadRequestException(
              'ticket has been claimed by another engineer',
            );

          const fullNumber = await this.getFullNumber(manager);

          if (!ticket) throw new NotFoundException('ticket not found');

          ticket.engineerId = engineerId;
          ticket.startAt = new Date();
          ticket.status = TicketStatus.InProgress;
          ticket.fullNumber = fullNumber;

          const updatedTicket = manager.create(Ticket, ticket);
          return await manager.save(Ticket, updatedTicket);
        },
      );
    } catch {
      throw new BadRequestException('this ticket is already taken');
    }
  }

  private async getFullNumber(
    manager: EntityManager,
    template?: string,
  ): Promise<string> {
    const latestTicket = await manager.findOne(Ticket, {
      where: {},
      order: { sequenceNumber: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });

    const nextNumber: number = latestTicket
      ? latestTicket.sequenceNumber + 1
      : 1;

    return template
      ? Mustache.render(template, {
          sequenceNumber: nextNumber,
        })
      : `${nextNumber}`;
  }

  async findAll(): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketRepository.find({
      relations: {
        asset: {
          category: true,
          assetAssignments: {
            employee: true,
          },
        },
        createdBy: true,
        engineer: true,
        employee: true,
        location: true,
        slaPolicy: true,
      },
      order: {
        createdAt: 'DESC',
        asset: {
          assetAssignments: {
            assignedAt: 'DESC',
          },
        },
      },
    });

    const formattedTicket = tickets.map((ticket) => {
      if (
        ticket.asset &&
        ticket.asset.assetAssignments &&
        ticket.asset.assetAssignments.length > 0
      ) {
        const lastAssigment = ticket.asset.assetAssignments.find(
          (value) => value.picEmployeeNik == ticket.employeeNik,
        );
        const user = {
          name: ticket.employee?.name,
          nik: ticket.employee?.nik,
          userNonEmployeeName: lastAssigment?.userNonEmployeeName,
        };
        return {
          ...ticket,
          asset: {
            ...ticket.asset,
            assetAssignment: user,
          },
        };
      }
      return {
        ...ticket,
      };
    });
    return plainToInstance(TicketResponseDto, formattedTicket);
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
        employee: true,
        location: true,
        slaPolicy: true,
      },
      order: {
        createdAt: 'DESC',
        asset: {
          assetAssignments: {
            assignedAt: 'DESC',
          },
        },
      },
    });
    if (!ticket) throw new NotFoundException('ticket not found');
    let formattedTicket;
    if (
      ticket &&
      ticket.asset &&
      ticket.asset.assetAssignments &&
      ticket.asset.assetAssignments.length > 0
    ) {
      const lastAssigment = ticket.asset.assetAssignments.find(
        (value) => value.picEmployeeNik == ticket.employeeNik,
      );
      const user = {
        name: ticket.employee?.name,
        nik: ticket.employee?.nik,
        userNonEmployeeName: lastAssigment?.userNonEmployeeName,
      };
      formattedTicket = {
        ...ticket,
        asset: {
          ...ticket.asset,
          assetAssignment: user,
        },
      };
    } else {
      formattedTicket = {
        ...ticket,
      };
    }
    return plainToInstance(TicketResponseDto, formattedTicket);
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) throw new NotFoundException('ticket not found');
    this.ticketRepository.merge(ticket, dto);
    return await this.ticketRepository.save(ticket);
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

    // Convert Map kembali menjadi Array of Objects standar untuk Frontend
    return Array.from(trendMap.entries()).map(([label, count]) => ({
      label,
      count,
    }));
  }

  async getCountByStatus() {
    const [
      total,
      open,
      pending,
      inProgress,
      closedRemote,
      closedVisit,
      closedOnsite,
      resolved,
    ] = await Promise.all([
      this.ticketRepository.count(),
      this.ticketRepository.count({ where: { status: TicketStatus.Open } }),
      this.ticketRepository.count({ where: { status: TicketStatus.Pending } }),
      this.ticketRepository.count({
        where: { status: TicketStatus.InProgress },
      }),
      this.ticketRepository.count({
        where: { status: TicketStatus.ClosedRemote },
      }),
      this.ticketRepository.count({
        where: { status: TicketStatus.ClosedVisit },
      }),
      this.ticketRepository.count({
        where: { status: TicketStatus.ClosedOnsite },
      }),
      this.ticketRepository.count({ where: { status: TicketStatus.Resolved } }),
    ]);

    return {
      total,
      open,
      pending,
      inProgress,
      closedRemote,
      closedVisit,
      closedOnsite,
      resolved,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }

  async createTicketPdfFromWordTemplate(ticketId: number) {
    const ticket = await this.findOne(ticketId);
    const template = await this.templateService.findByType(TemplateType.Ticket);
    const absoluteTemplatePath = path.join(process.cwd(), template.filePath);
    if (!fs.existsSync(absoluteTemplatePath)) {
      throw new NotFoundException(
        `File template not found at path: ${template.filePath}`,
      );
    }

    try {
      // 3. Baca template docx
      const content = fs.readFileSync(absoluteTemplatePath, 'binary');
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        ticketNumber: ticket.fullNumber || '-',
        problem: ticket.problem || '-',
        solution: ticket.solution || '-',

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

        engineerName: ticket.engineer?.fullName || '-',

        employeeName: ticket.employee?.name || '-',
        employeeNik: ticket.employee?.nik || '-',
        employeePosition: ticket.employee?.position || '-',
        employeeDepartment: ticket.employee?.department || '-',

        assetName: ticket.asset
          ? `${ticket.asset?.brand} ${ticket.asset?.model}`
          : '-',
        assetTag: ticket.asset?.assetTag || '-',
        assetCategory: ticket.asset?.category.name || '-',

        vendorName: ticket.asset?.project?.vendor?.name || '-',
        projectName: ticket.asset?.project?.name || '-',
      });

      const filledDocxBuffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      libre.convertAsync = promisify(libre.convert);
      // 5. Konversi docx -> pdf
      const pdfBuffer: Buffer = await libre.convertAsync(
        filledDocxBuffer,
        '.pdf',
        undefined,
      );
      return pdfBuffer;
    } catch {
      throw new InternalServerErrorException(
        "server is busy, please try again later",
      );
    }
  }
}
