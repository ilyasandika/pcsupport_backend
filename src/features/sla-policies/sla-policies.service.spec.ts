import { Test, TestingModule } from '@nestjs/testing';
import { SlaPoliciesService } from './sla-policies.service';

describe('SlaPoliciesService', () => {
  let service: SlaPoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlaPoliciesService],
    }).compile();

    service = module.get<SlaPoliciesService>(SlaPoliciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
