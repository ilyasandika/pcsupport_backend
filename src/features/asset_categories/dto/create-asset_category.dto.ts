import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
