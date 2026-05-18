import { Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset_assignments.service';
import { AssetAssignmentsController } from './asset_assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAssignment } from './entities/asset_assignment.entity';
import { EmployeesModule } from '../employees/employees.module';
import { AssetsService } from '../assets/assets.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetAssignment]),
    EmployeesModule,
    AssetsModule,
  ],
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService],
})
export class AssetAssignmentsModule {}
