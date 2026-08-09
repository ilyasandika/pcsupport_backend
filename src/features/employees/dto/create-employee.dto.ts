import {

  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  nik: string;

  @IsOptional()
  nik2?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  fs?: string;

  @IsOptional()
  @IsString()
  mjl?: string;

  @IsOptional()
  @IsString()
  bod?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  directorate?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  retireDate?: Date;
}
