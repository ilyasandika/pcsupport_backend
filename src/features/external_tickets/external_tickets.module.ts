import { Module } from '@nestjs/common';
import { ExternalTicketsService } from './external_tickets.service';
import { ExternalTicketsController } from './external_tickets.controller';
import { ExternalTicket } from './entities/external_ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalTicket])],
  controllers: [ExternalTicketsController],
  providers: [ExternalTicketsService],
})
export class ExternalTicketsModule {}
