import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReturnAssetAssignmentDto {
  @IsDateString()
  @IsNotEmpty()
  returnedAt: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNotEmpty()
  @IsNumber()
  engineerId: number;
}
