import { Test, TestingModule } from '@nestjs/testing';
import { AssetSupportsService } from './asset_supports.service';

describe('AssetSupportsService', () => {
  let service: AssetSupportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetSupportsService],
    }).compile();

    service = module.get<AssetSupportsService>(AssetSupportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
