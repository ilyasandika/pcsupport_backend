import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsNumber()
  assetId?: number;

  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @IsOptional()
  @IsNumber()
  engineerId?: number;

  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @IsNotEmpty()
  @IsString()
  problem: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsDateString()
  @IsOptional()
  solvedAt?: Date;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  fullNumberTemplate: string;
}
