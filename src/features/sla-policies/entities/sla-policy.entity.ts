import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';

enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    default: Priority.LOW,
    enum: Priority,
  })
  priority: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    default: false,
    name: 'is_default',
    type: 'boolean',
  })
  isDefault: boolean;

  @Column({ type: 'bigint', default: 0 })
  responseTimeSeconds: number;

  @Column({ type: 'bigint', default: 0 })
  resolutionTimeSeconds: number;

  @Column({ type: 'boolean', default: true })
  isBusinessHourOnly: boolean;

  @OneToMany(() => Ticket, (ticket) => ticket.slaPolicy)
  tickets: Ticket[];

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
