import { Test, TestingModule } from '@nestjs/testing';
import { WorkLocationsService } from './work-locations.service';

describe('WorkLocationsService', () => {
  let service: WorkLocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkLocationsService],
    }).compile();

    service = module.get<WorkLocationsService>(WorkLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
