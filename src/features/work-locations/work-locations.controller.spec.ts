import { Test, TestingModule } from '@nestjs/testing';
import { WorkLocationsController } from './work-locations.controller';
import { WorkLocationsService } from './work-locations.service';

describe('WorkLocationsController', () => {
  let controller: WorkLocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkLocationsController],
      providers: [WorkLocationsService],
    }).compile();

    controller = module.get<WorkLocationsController>(WorkLocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
