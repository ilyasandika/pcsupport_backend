import { Expose, Type } from 'class-transformer';
import { ProjectResponseDto } from '../../projects/dto/project-response.dto';
import { VendorSupportContact } from '../../vendor_support_contacts/entities/vendor_support_contact.entity';

export class VendorResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;

  @Expose()
  @Type(() => ProjectResponseDto)
  projects?: ProjectResponseDto[];

  @Expose()
  @Type(() => VendorSupportContact)
  contacts?: VendorSupportContact[];
}
