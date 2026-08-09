import { Expose, Type } from 'class-transformer';
import { VendorResponseDto } from '../../vendors/dto/vendor-response.dto';

export class ProjectResponseDto {
  @Expose()
  name: string;
  @Expose()
  @Type(() => VendorResponseDto)
  vendor?: VendorResponseDto;
}