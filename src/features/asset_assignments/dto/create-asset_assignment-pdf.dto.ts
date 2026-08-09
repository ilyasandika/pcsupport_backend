import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentPdfDto {
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  engineerId: number;

  @IsNotEmpty()
  @IsNumber()
  supervisorId: number;
}
