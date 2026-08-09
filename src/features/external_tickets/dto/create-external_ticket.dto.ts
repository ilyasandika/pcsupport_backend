import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString, IsEnum,
} from 'class-validator';
import { ExternalTicketStatus } from '../entities/external_ticket.entity';

export class CreateExternalTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketFullNumber: string;

  @IsInt()
  @IsNotEmpty()
  vendorId: number;

  @IsString()
  @IsNotEmpty()
  caseNumber: string;

  @IsString()
  @IsNotEmpty()
  problem: string;

  @IsDateString()
  @IsNotEmpty()
  escalatedDate: Date;

  @IsOptional()
  @IsEnum(ExternalTicketStatus)
  status?: ExternalTicketStatus;
}
