import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { AssetAssignmentsModule } from '../asset_assignments/asset_assignments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), AssetAssignmentsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
