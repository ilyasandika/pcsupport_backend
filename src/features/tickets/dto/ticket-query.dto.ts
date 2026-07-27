// tickets/dto/ticket-query.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class TicketQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  assetSn?: string;

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  employeeNik?: string;

  @IsOptional()
  @IsString()
  engineerName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  startAt?: string;

  @IsOptional()
  @IsString()
  solvedAt?: string;

  @IsOptional()
  @IsString()
  solution?: string;
}
