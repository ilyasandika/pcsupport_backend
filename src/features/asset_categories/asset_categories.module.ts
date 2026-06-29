import { Module } from '@nestjs/common';
import { AssetCategoriesService } from './asset_categories.service';
import { AssetCategoriesController } from './asset_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCategory } from './entities/asset_category.entity';

@Module({
  imports : [TypeOrmModule.forFeature([AssetCategory])],
  controllers: [AssetCategoriesController],
  providers: [AssetCategoriesService],
})
export class AssetCategoriesModule {}
