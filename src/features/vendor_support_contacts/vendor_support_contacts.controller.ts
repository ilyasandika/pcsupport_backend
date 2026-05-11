import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VendorSupportContactsService } from './vendor_support_contacts.service';
import { CreateVendorSupportContactDto } from './dto/create-vendor_support_contact.dto';
import { UpdateVendorSupportContactDto } from './dto/update-vendor_support_contact.dto';

@Controller('support-contacts')
export class VendorSupportContactsController {
  constructor(
    private readonly vendorSupportContactsService: VendorSupportContactsService,
  ) {}

  @Post()
  create(@Body() dto: CreateVendorSupportContactDto) {
    return this.vendorSupportContactsService.create(dto);
  }

  // @Get(':id')
  // findAllByVendorId(@Param('id') id: string) {
  //   return this.vendorSupportContactsService.findAllByVendorId(+id);
  // }

  @Get()
  findAll() {
    return this.vendorSupportContactsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorSupportContactsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorSupportContactDto) {
    return this.vendorSupportContactsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorSupportContactsService.remove(+id);
  }
}
