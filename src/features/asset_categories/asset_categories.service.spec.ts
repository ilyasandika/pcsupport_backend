import { Test, TestingModule } from '@nestjs/testing';
import { AssetCategoriesService } from './asset_categories.service';

describe('AssetCategoriesService', () => {
  let service: AssetCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetCategoriesService],
    }).compile();

    service = module.get<AssetCategoriesService>(AssetCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
