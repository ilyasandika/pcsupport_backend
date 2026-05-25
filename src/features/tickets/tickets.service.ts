import {
  BadRequestException, HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import Mustache from 'mustache';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { AssetAssignmentsService } from '../asset_assignments/asset_assignments.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly assetAssignmentService: AssetAssignmentsService,
  ) {}

  async create(dto: CreateTicketDto, creatorId: number) {

    try {
      return await this.ticketRepository.manager.transaction(
        async (manager) => {
          const latestTicket = await manager.findOne(Ticket, {
            where: {},
            order: { sequenceNumber: 'DESC' },
            lock: { mode: 'pessimistic_write' },
          });

          // let assetOwner;
          if (dto.assetId) {
            const assetAssignment =
              await this.assetAssignmentService.findLatestByAssetId(
                dto.assetId,
                manager,
              );

            if (assetAssignment) {

              //dto employee id tidak sesuai dengan data kepemilikan asset dan belum dikembalikan
              if (
                dto.employeeId &&
                assetAssignment.picEmployeeId != dto.employeeId &&
                !assetAssignment.returnedAt
              ) {
                throw new BadRequestException(
                  'the specified asset does not belong to this employee',
                );
              }

              //dto employee ada, asset sudah dikembalikan.
              if (dto.employeeId && assetAssignment.returnedAt) {
                throw new BadRequestException(
                  'the specified asset has returned, employee id should empty',
                );
              }

              //dto employee id kosong dan asset belum dikembalikan.
              if (dto.employeeId == undefined && !assetAssignment.returnedAt) {
                throw new BadRequestException('this asset still have an owner');
              }
            } else {
              if (dto.employeeId) {
                throw new BadRequestException(
                  'this is new asset, please assign the asset first',
                );
              }
            }
          }

          const nextNumber: number = latestTicket
            ? latestTicket.sequenceNumber + 1
            : 1;

          let fullNumber: string | undefined;
          if (dto.engineerId) {
            fullNumber = dto.fullNumberTemplate
              ? Mustache.render(dto.fullNumberTemplate, {
                  sequenceNumber: nextNumber,
                })
              : `${new Date().getFullYear() % 100}-${nextNumber}`;
          }

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

          return await manager.save(Ticket, newTicket);
        },
      );
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
            order: { sequenceNumber: 'DESC' },
            lock: { mode: 'pessimistic_write' },
          });

          if (!ticket) throw new NotFoundException('ticket not found');

          ticket.engineerId = engineerId;
          ticket.startAt = new Date();
          ticket.status = TicketStatus.InProgress;

          const updatedTicket = manager.create(Ticket, ticket);
          return await manager.save(Ticket, updatedTicket);
        },
      );
    } catch {
      throw new BadRequestException('this ticket is already taken');
    }
  }

  async findAll() {
    return await this.ticketRepository.find({
      relations: {
        asset: true,
        createdBy: true,
        engineer: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.ticketRepository.findOneOrFail({
        where: { id },
        relations: {
          asset: true,
          createdBy: true,
          engineer: true,
        },
      });
    } catch {
      throw new NotFoundException('ticket not found');
    }
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOneBy({ id });
    if (!ticket) throw new NotFoundException('ticket not found');
    this.ticketRepository.merge(ticket, dto);
    return await this.ticketRepository.save(ticket);
  }

  async remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
