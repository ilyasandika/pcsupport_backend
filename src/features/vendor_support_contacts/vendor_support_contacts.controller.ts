import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VendorSupportContactsService } from './vendor_support_contacts.service';
import { CreateVendorSupportContactDto } from './dto/create-vendor_support_contact.dto';
import { UpdateVendorSupportContactDto } from './dto/update-vendor_support_contact.dto';

@Controller('vendor-support-contacts')
export class VendorSupportContactsController {
  constructor(private readonly vendorSupportContactsService: VendorSupportContactsService) {}

  @Post()
  create(@Body() createVendorSupportContactDto: CreateVendorSupportContactDto) {
    return this.vendorSupportContactsService.create(createVendorSupportContactDto);
  }

  @Get()
  findAll() {
    return this.vendorSupportContactsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorSupportContactsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorSupportContactDto: UpdateVendorSupportContactDto) {
    return this.vendorSupportContactsService.update(+id, updateVendorSupportContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorSupportContactsService.remove(+id);
  }
}
