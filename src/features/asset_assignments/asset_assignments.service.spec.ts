import { Test, TestingModule } from '@nestjs/testing';
import { AssetAssignmentsService } from './asset_assignments.service';

describe('AssetAssignmentsService', () => {
  let service: AssetAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetAssignmentsService],
    }).compile();

    service = module.get<AssetAssignmentsService>(AssetAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
