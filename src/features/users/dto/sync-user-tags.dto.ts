import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SyncUserTagsDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;
}
