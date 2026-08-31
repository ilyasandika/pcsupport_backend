import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SyncUserTagsDto {
  @IsOptional()
  @IsString()
  period?: string; // Format: "YYYY-MM" (contoh: "2025-01") atau "YYYY-M"

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number; // Contoh: 2025

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number; // 1-12
}
