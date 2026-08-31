import { Expose, Type } from 'class-transformer';
import { ProjectResponseDto } from '../../projects/dto/project-response.dto';

export class VendorContactResponseDto {
  @Expose()
  type: string;

  @Expose()
  value: string;
}

export class VendorResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Type(() => VendorContactResponseDto)
  contacts?: VendorContactResponseDto[];

  @Expose()
  @Type(() => ProjectResponseDto)
  projects?: ProjectResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
