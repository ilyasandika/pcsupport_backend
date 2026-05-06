import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorSupportContactDto } from './create-vendor_support_contact.dto';

export class UpdateVendorSupportContactDto extends PartialType(CreateVendorSupportContactDto) {}
