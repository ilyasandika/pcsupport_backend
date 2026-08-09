import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsDateString()
  @IsOptional()
  solvedAt?: Date;
}
