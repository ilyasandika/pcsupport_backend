import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';


export enum ExternalTicketStatus {
  InProgress = 'in progress',
  Closed = 'closed',
  Cancelled = 'cancelled',
}


@Entity('external_tickets')
export class ExternalTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_full_number' })
  ticketFullNumber: string;

  @OneToOne(() => Ticket, (ticket) => ticket.externalTicket)
  @JoinColumn({
    name: 'ticket_full_number',
    referencedColumnName: 'fullNumber',
  })
  ticket: Ticket;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.externalTickets)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ name: 'case_number', type: 'varchar', length: 255 })
  caseNumber: string;

  @Column({ type: 'text' })
  problem: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ name: 'escalated_date', type: 'timestamptz' })
  escalatedDate: Date;

  @Column({ name: 'resolved_date', type: 'timestamptz', nullable: true })
  resolvedDate: Date;

  @Column({
    enum: ExternalTicketStatus,
    default: ExternalTicketStatus.InProgress,
  })
  status: ExternalTicketStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
