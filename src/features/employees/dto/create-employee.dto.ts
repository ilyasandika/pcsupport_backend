import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  nik: string;

  @IsOptional()
  @IsString()
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

  @IsNotEmpty({
    message: 'Work Location is required',
  })
  @IsNumber(
    {},
    {
      message: 'Work Location must be a valid location ID number',
    },
  )
  workLocationId: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  retireDate?: Date;
}
