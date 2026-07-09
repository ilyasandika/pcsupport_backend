import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  assetSn?: string;

  @IsOptional()
  @IsString()
  employeeNik?: string;

  @IsOptional()
  @IsNumber()
  engineerId?: number;

  @IsNotEmpty()
  @IsString()
  problem: string;

  @IsNotEmpty()
  @IsNumber()
  slaPolicyId: number;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  fullNumberTemplate?: string;
}
