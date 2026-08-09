import { forwardRef, Module } from '@nestjs/common';
import { AssetAssignmentsService } from './asset_assignments.service';
import { AssetAssignmentsController } from './asset_assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAssignment } from './entities/asset_assignment.entity';
import { EmployeesModule } from '../employees/employees.module';
import { AssetsModule } from '../assets/assets.module';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from '../users/users.module';
import { TicketsModule } from '../tickets/tickets.module';
import { Employee } from '../employees/entities/employee.entity';
import { Asset } from '../assets/entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetAssignment, Employee, Asset]),
    EmployeesModule,
    AssetsModule,
    TemplatesModule,
    UsersModule,
    forwardRef(() => TicketsModule),
  ],
  controllers: [AssetAssignmentsController],
  providers: [AssetAssignmentsService],
  exports: [AssetAssignmentsService],
})
export class AssetAssignmentsModule {}
