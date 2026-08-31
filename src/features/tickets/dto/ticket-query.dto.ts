// tickets/dto/ticket-query.dto.ts
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { Transform } from 'class-transformer';

export class TicketQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  asset?: string; // for search asset by tag or sn

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  assetSn?: string;

  @IsOptional()
  @IsArray()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.includes(','))
      return value.split(',').map((v) => v.trim());
    return [value];
  })
  category?: string[];

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  employee?: string; // for search employee by name or nik

  @IsOptional()
  @IsString()
  employeeNik?: string;

  @IsOptional()
  @IsString()
  engineerName?: string;

  @IsOptional()
  @IsString()
  createdByName?: string;

  @IsOptional()
  @IsString()
  approvedByName?: string;



  @IsOptional()
  @IsArray()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map((v) => Number(v));
    if (typeof value === 'string' && value.includes(','))
      return value.split(',').map((v) => Number(v));
    return [Number(value)];
  })
  locationId?: number | number[];

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

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasBackupAsset?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isNeedBackup?: boolean;
}
