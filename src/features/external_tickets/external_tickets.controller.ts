import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExternalTicketsService } from './external_tickets.service';
import { CreateExternalTicketDto } from './dto/create-external_ticket.dto';
import { UpdateExternalTicketDto } from './dto/update-external_ticket.dto';

@Controller('external-tickets')
export class ExternalTicketsController {
  constructor(
    private readonly externalTicketsService: ExternalTicketsService,
  ) {}

  @Post()
  create(@Body() createExternalTicketDto: CreateExternalTicketDto) {
    return this.externalTicketsService.create(createExternalTicketDto);
  }

  @Get()
  findAll() {
    return this.externalTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.externalTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExternalTicketDto: UpdateExternalTicketDto,
  ) {
    return this.externalTicketsService.update(+id, updateExternalTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.externalTicketsService.remove(+id);
  }
}
