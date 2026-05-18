import { Test, TestingModule } from '@nestjs/testing';
import { AssetAssignmentsController } from './asset_assignments.controller';
import { AssetAssignmentsService } from './asset_assignments.service';

describe('AssetAssignmentsController', () => {
  let controller: AssetAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetAssignmentsController],
      providers: [AssetAssignmentsService],
    }).compile();

    controller = module.get<AssetAssignmentsController>(AssetAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
