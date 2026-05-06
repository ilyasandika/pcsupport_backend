import { Test, TestingModule } from '@nestjs/testing';
import { VendorSupportContactsController } from './vendor_support_contacts.controller';
import { VendorSupportContactsService } from './vendor_support_contacts.service';

describe('VendorSupportContactsController', () => {
  let controller: VendorSupportContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorSupportContactsController],
      providers: [VendorSupportContactsService],
    }).compile();

    controller = module.get<VendorSupportContactsController>(VendorSupportContactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
