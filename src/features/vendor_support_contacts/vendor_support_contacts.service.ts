import { Injectable } from '@nestjs/common';
import { CreateVendorSupportContactDto } from './dto/create-vendor_support_contact.dto';
import { UpdateVendorSupportContactDto } from './dto/update-vendor_support_contact.dto';

@Injectable()
export class VendorSupportContactsService {
  create(createVendorSupportContactDto: CreateVendorSupportContactDto) {
    return 'This action adds a new vendorSupportContact';
  }

  findAll() {
    return `This action returns all vendorSupportContacts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendorSupportContact`;
  }

  update(id: number, updateVendorSupportContactDto: UpdateVendorSupportContactDto) {
    return `This action updates a #${id} vendorSupportContact`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendorSupportContact`;
  }
}
