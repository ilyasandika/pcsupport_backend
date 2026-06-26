import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint', default: 0 })
  responseTimeSeconds: number;

  @Column({ type: 'bigint', default: 0 })
  resolutionTimeSeconds: number;

  @Column({ type: 'boolean', default: true })
  isBusinessHourOnly: boolean;

  @OneToMany(() => Ticket, (ticket) => ticket.slaPolicy)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
