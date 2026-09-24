import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CloseTicketDto {
  @IsNotEmpty()
  solution: string;

  @IsIn([
    TicketStatus.ClosedOnsite,
    TicketStatus.ClosedVisit,
    TicketStatus.ClosedRemote,
    TicketStatus.Resolved,
  ])
  status:
    | TicketStatus.ClosedOnsite
    | TicketStatus.ClosedVisit
    | TicketStatus.ClosedRemote
    | TicketStatus.Resolved;

  @IsOptional()
  solvedAt?: Date;

  @IsOptional()
  backupAssetTag?: string;
}