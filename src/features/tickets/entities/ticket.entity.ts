import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { Asset } from '../../assets/entities/asset.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
import { SlaPolicy } from '../../sla-policies/entities/sla-policy.entity';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';

@Entity({
  name: 'tickets',
})
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'sequence_number',
    unique: true,
  })
  sequenceNumber: number;

  @Column({
    name: 'full_number',
    unique: true,
    nullable: true,
  })
  fullNumber: string;

  @Column({
    name: 'asset_id',
    nullable: true,
  })
  assetId?: number;

  @ManyToOne(() => Asset, (asset) => asset.tickets)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({
    name: 'employee_nik',
    nullable: true,
  })
  employeeNik?: string;

  @ManyToOne(() => Employee, (employee) => employee.tickets)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'engineer_id',
    nullable: true,
  })
  engineerId?: number;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'engineer_id' })
  engineer: User;

  @Column({
    name: 'created_by_user_id',
  })
  createdByUserId: number;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @Column()
  problem: string;

  @Column({
    name: 'sla_policy_id',
  })
  slaPolicyId: number;

  @ManyToOne(() => SlaPolicy, (sla) => sla.tickets)
  @JoinColumn({ name: 'sla_policy_id' })
  slaPolicy: SlaPolicy;

  @Column({
    name: 'location_id',
    nullable: true,
  })
  locationId: number;

  @ManyToOne(() => WorkLocation, (location) => location.tickets)
  @JoinColumn({ name: 'location_id' })
  location: SlaPolicy;

  @Column({
    default: TicketStatus.Open,
    type: 'enum',
    enum: TicketStatus,
  })
  status: TicketStatus;

  @Column({
    nullable: true,
  })
  solution?: string;

  @Column({
    nullable: true,
    name: 'start_at',
  })
  startAt: Date;

  @Column({
    name: 'solved_at',
    nullable: true,
  })
  solvedAt?: Date;

  @Column({
    nullable: true,
  })
  remarks?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
