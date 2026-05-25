import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import * as jwtPayloadInterface from '../../common/interfaces/jwt-payload.interface';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.Helpdesk, Role.Admin)
  async create(
    @Body() dto: CreateTicketDto,
    @GetUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return await this.ticketsService.create(dto, user.sub as number);
  }

  @Patch('claim/:id')
  async claim(
    @Param('id') id: string,
    @GetUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return await this.ticketsService.claimTicket(+id, user.sub as number);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
