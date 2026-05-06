import { Module } from '@nestjs/common';
import { VendorSupportContactsService } from './vendor_support_contacts.service';
import { VendorSupportContactsController } from './vendor_support_contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorSupportContact } from './entities/vendor_support_contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VendorSupportContact])],
  controllers: [VendorSupportContactsController],
  providers: [VendorSupportContactsService],
})
export class VendorSupportContactsModule {}
