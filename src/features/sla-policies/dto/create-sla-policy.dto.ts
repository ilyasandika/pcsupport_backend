import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSlaPolicyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  responseTimeSeconds: number;

  @IsNotEmpty()
  @IsNumber()
  resolutionTimeSeconds: number;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isBusinessHourOnly: boolean;
}
