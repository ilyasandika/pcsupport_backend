import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDecimal({ decimal_digits: '6' })
  longitude: number;

  @IsDecimal({ decimal_digits: '6' })
  latitude: number;

  @IsNotEmpty()
  @IsString()
  address: string;
}
