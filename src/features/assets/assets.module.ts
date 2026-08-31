import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetCategoriesModule } from '../asset_categories/asset_categories.module';
import { AssetAssignment } from '../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { WorkLocationsModule } from '../work-locations/work-locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetAssignment, Ticket]),
    AssetCategoriesModule,
    WorkLocationsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
