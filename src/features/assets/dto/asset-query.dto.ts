import { AssetStatus } from '../entities/asset.entity';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class AssetQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsArray()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: AssetStatus[];

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
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  employee?: string; // for search employee by name or nik

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  employeeNik?: string;

  @IsOptional()
  @IsArray()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  vendorProject?: string; // for search employee by name or nik

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  project?: string;
}
