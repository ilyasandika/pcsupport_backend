import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { AssignmentType } from '../../../common/enums/assignment-type.enum';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  employeeNik?: string;

  @IsOptional()
  @IsString()
  userNonEmployeeName?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsNumber()
  engineerId?: number;

  @IsNotEmpty()
  @IsString()
  problem: string;

  @IsOptional()
  @IsString()
  backupAssetTag?: string;

  @IsOptional()
  @IsNumber()
  slaPolicyId?: number;

  @IsOptional()
  @IsNumber()
  locationId: number;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  fullNumberTemplate?: string;

  @IsOptional()
  @IsDateString()
  solvedAt?: Date;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsBoolean()
  isAssetAssignment?: boolean;

  @IsOptional()
  @IsEnum(AssignmentType)
  assignmentType?: AssignmentType;
}
