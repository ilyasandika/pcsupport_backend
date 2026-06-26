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

  @IsNotEmpty()
  @IsBoolean()
  isBusinessHourOnly: boolean;
}
