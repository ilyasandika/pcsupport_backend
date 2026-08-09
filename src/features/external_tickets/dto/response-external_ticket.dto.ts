import { Ticket } from '../../tickets/entities/ticket.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Expose, Type } from 'class-transformer';
import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';
import { VendorResponseDto } from '../../vendors/dto/vendor-response.dto';

export class ResponseExternalTicketDto {
  @Expose()
  id: number;

  @Expose()
  ticketFullNumber: string;

  @Expose()
  @Type(() => TicketResponseDto)
  ticket: TicketResponseDto;

  @Expose()
  @Type(() => VendorResponseDto)
  vendor: VendorResponseDto;

  @Expose()
  caseNumber: string;

  @Expose()
  problem: string;

  @Expose()
  status: string;

  @Expose()
  resolution: string;

  @Expose()
  escalatedDate: Date;

  @Expose()
  resolvedDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
