import { Expose } from 'class-transformer';
import { TemplateType } from '../entities/template.entity';

export class TemplateResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: TemplateType;

  @Expose()
  name: string;

  @Expose()
  filePath: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
