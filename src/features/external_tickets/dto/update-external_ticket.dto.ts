import { PartialType } from '@nestjs/mapped-types';
import { CreateExternalTicketDto } from './create-external_ticket.dto';

export class UpdateExternalTicketDto extends PartialType(CreateExternalTicketDto) {}
