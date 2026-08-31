import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity({
  name: 'asset_assignments',
})
@Index(['assetTag', 'assignedAt'])
export class AssetAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'asset_tag',
    nullable: true,
  })
  assetTag: string;

  @ManyToOne(() => Asset, (asset) => asset.assetAssignments)
  @JoinColumn({ name: 'asset_tag' })
  asset: Asset;

  @Column({
    name: 'assign_full_ticket_number',
    nullable: true,
  })
  assignFullTicketNumber?: string | null;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'assign_full_ticket_number', referencedColumnName: 'fullNumber' })
  assignTicket?: Ticket | null;

  @Column({
    name: 'return_full_ticket_number',
    nullable: true,
  })
  returnFullTicketNumber?: string | null;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'return_full_ticket_number', referencedColumnName: 'fullNumber' })
  returnTicket?: Ticket | null;

  @Column({
    name: 'pic_employee_nik',
  })
  @Index()
  picEmployeeNik: string;

  @ManyToOne(() => Employee, (employee) => employee.assetAssignments)
  @JoinColumn({ name: 'pic_employee_nik' })
  employee: Employee;

  @Column({
    name: 'user_non_employee_name',
    nullable: true,
  })
  userNonEmployeeName?: string;

  @Column({
    name: 'assigned_at',
    type: 'timestamptz',
    nullable: true,
  })
  assignedAt: Date;

  @Column({
    name: 'returned_at',
    nullable: true,
    type: 'timestamptz',
  })
  returnedAt?: Date | null;

  @Column({
    name: 'is_backup',
    nullable: true,
    default: false,
  })
  isBackup?: boolean;

  @Column({
    name: 'backup_for_asset_tag',
    nullable: true,
    comment: 'asset tag of asset that is backup',
  })
  backupForAssetTag?: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'backup_for_asset_tag' })
  backupForAsset?: Asset;

  @Column({
    name: 'is_under_maintenance',
    nullable: true,
    default: false,
  })
  isUnderMaintenance?: boolean;

  @Column({
    name: 'assign_file_path',
    nullable: true,
    type: 'text',
  })
  assignFilePath?: string | null;

  @Column({
    name: 'return_file_path',
    nullable: true,
    type: 'text',
  })
  returnFilePath?: string | null;

  @Column({
    name: 'assign_user_signature_path',
    nullable: true,
    type: 'text',
  })
  assignUserSignaturePath?: string | null;

  @Column({
    name: 'return_user_signature_path',
    nullable: true,
    type: 'text',
  })
  returnUserSignaturePath?: string | null;

  @Column({
    nullable: true,
  })
  assignRemarks?: string;

  @Column({
    nullable: true,
  })
  returnRemarks?: string;

  @Column({
    nullable: true,
  })
  legacyBastStatus?: string;

  @Column({
    nullable: true,
  })
  contact?: string;

  @Column({
    name: 'created_by_id',
  })
  createdById: number;

  @ManyToOne(() => User, (user) => user.createdAssetAssignments)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({
    name: 'assign_by_id',
    nullable: true,
  })
  assignById?: number;

  @ManyToOne(() => User, (user) => user.assignedAssetAssignments)
  @JoinColumn({ name: 'assign_by_id' })
  assignBy: User;

  @Column({
    name: 'return_by_id',
    nullable: true,
  })
  returnById: number;

  @ManyToOne(() => User, (user) => user.assignedAssetAssignments)
  @JoinColumn({ name: 'return_by_id' })
  returnBy: User;

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

  @Column({
    name: 'is_legacy_data',
    default: false,
  })
  isLegacyData: boolean;
}
