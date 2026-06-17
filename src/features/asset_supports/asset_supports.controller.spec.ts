import { Test, TestingModule } from '@nestjs/testing';
import { AssetSupportsController } from './asset_supports.controller';
import { AssetSupportsService } from './asset_supports.service';

describe('AssetSupportsController', () => {
  let controller: AssetSupportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetSupportsController],
      providers: [AssetSupportsService],
    }).compile();

    controller = module.get<AssetSupportsController>(AssetSupportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
