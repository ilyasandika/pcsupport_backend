import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '6' })
  longitude: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '6' })
  latitude: number;

  @IsOptional()
  @IsString()
  address: string;
}
