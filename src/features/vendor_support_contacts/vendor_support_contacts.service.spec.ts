import { Test, TestingModule } from '@nestjs/testing';
import { VendorSupportContactsService } from './vendor_support_contacts.service';

describe('VendorSupportContactsService', () => {
  let service: VendorSupportContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorSupportContactsService],
    }).compile();

    service = module.get<VendorSupportContactsService>(VendorSupportContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
