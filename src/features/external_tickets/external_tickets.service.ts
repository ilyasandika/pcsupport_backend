import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalTicket } from './entities/external_ticket.entity';
import { CreateExternalTicketDto } from './dto/create-external_ticket.dto';
import { UpdateExternalTicketDto } from './dto/update-external_ticket.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseExternalTicketDto } from './dto/response-external_ticket.dto';

@Injectable()
export class ExternalTicketsService {
  constructor(
    @InjectRepository(ExternalTicket)
    private readonly externalTicketRepository: Repository<ExternalTicket>,
  ) {}

  async create(
    createExternalTicketDto: CreateExternalTicketDto,
  ): Promise<ExternalTicket> {
    const newExternalTicket = this.externalTicketRepository.create(
      createExternalTicketDto,
    );
    return await this.externalTicketRepository.save(newExternalTicket);
  }

  async findAll(): Promise<ResponseExternalTicketDto[]> {
    const externalTickets = await this.externalTicketRepository.find({
      relations: ['ticket', 'vendor'],
      order: { createdAt: 'DESC' },
    });

    return plainToInstance(ResponseExternalTicketDto, externalTickets);
  }

  async findOne(id: number): Promise<ResponseExternalTicketDto> {
    const externalTicket = await this.externalTicketRepository.findOne({
      where: { id },
      relations: ['ticket', 'vendor'],
    });

    if (!externalTicket) {
      throw new NotFoundException(`External Ticket with ID ${id} not found`);
    }

    return plainToInstance(ResponseExternalTicketDto, externalTicket);
  }

  async update(
    id: number,
    updateExternalTicketDto: UpdateExternalTicketDto,
  ): Promise<ExternalTicket> {
    const externalTicket = await this.externalTicketRepository.preload({
      id,
      ...updateExternalTicketDto,
    });

    if (!externalTicket) {
      throw new NotFoundException(`External Ticket with ID ${id} not found`);
    }

    return await this.externalTicketRepository.save(externalTicket);
  }

  async remove(id: number): Promise<void> {
    const externalTicket = await this.findOne(id);
    await this.externalTicketRepository.delete(externalTicket.id);
  }
}
