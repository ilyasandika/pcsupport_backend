import { Test, TestingModule } from '@nestjs/testing';
import { SlaPoliciesController } from './sla-policies.controller';
import { SlaPoliciesService } from './sla-policies.service';

describe('SlaPoliciesController', () => {
  let controller: SlaPoliciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlaPoliciesController],
      providers: [SlaPoliciesService],
    }).compile();

    controller = module.get<SlaPoliciesController>(SlaPoliciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
