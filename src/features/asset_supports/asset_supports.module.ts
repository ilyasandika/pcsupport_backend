import { Module } from '@nestjs/common';
import { AssetSupportsService } from './asset_supports.service';
import { AssetSupportsController } from './asset_supports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetSupport } from './entities/asset_support.entity';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [TypeOrmModule.forFeature([AssetSupport]), AssetsModule],
  controllers: [AssetSupportsController],
  providers: [AssetSupportsService],
})
export class AssetSupportsModule {}
