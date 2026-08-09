import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketPdfDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  supervisorId: number;
}
