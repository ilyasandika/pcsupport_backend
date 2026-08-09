import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { AssetAssignmentsModule } from '../asset_assignments/asset_assignments.module';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from '../users/users.module';
import { SlaPoliciesModule } from '../sla-policies/sla-policies.module';
import { AssetsModule } from '../assets/assets.module';
import { WorkLocationsModule } from '../work-locations/work-locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    forwardRef(() => AssetAssignmentsModule),
    TemplatesModule,
    SlaPoliciesModule,
    AssetsModule,
    UsersModule,
    WorkLocationsModule,
  ],
  controllers: [TicketsController],
  exports: [TicketsService],
  providers: [TicketsService],
})
export class TicketsModule {}
