import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TemplateType } from '../entities/template.entity';

export class CreateTemplateDto {
  @IsEnum(TemplateType)
  @IsNotEmpty()
  type: TemplateType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
