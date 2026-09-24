import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTicketPdfDto {
  @IsNotEmpty()
  supervisorId: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  eSignEngineer?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  eSignSupervisor?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  eSignUser?: boolean;
}
