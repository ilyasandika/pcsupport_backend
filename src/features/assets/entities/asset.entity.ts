import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Project } from '../../projects/entities/project.entity';
import { AssetCategory } from '../../asset_categories/entities/asset_category.entity';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';

export enum SupportType {
  Charger = 'charger',
  Lcd = 'lcd',
}

export interface SupportDetail {
  type: SupportType;
  sn: string;
  name?: string;
}

export enum AssetStatus {
  Assigned = 'assigned',
  AssignedForBackup = 'assigned for backup',
  Undeployed = 'undeployed',
  PendingBast = 'pending bast',
  ReadyStock = 'ready stock',
  Damaged = 'damaged',
  Offline = 'offline',
  Returned = 'returned', // not ready for use
  Missing = 'missing',
  Backup = 'backup',
  Unknown = 'unknown',
}

@Entity({
  name: 'assets',
})
export class Asset {
  @PrimaryColumn({
    name: 'asset_tag',
    unique: true,
  })
  assetTag: string;

  @Column({
    name: 'serial_number',
    unique: true,
    nullable: true,
  })
  serialNumber?: string;

  @Column()
  hostname: string;

  // @Column()
  // brand: string;
  //
  // @Column({
  //   nullable: true,
  // })
  // model?: string;

  @Column()
  type?: string;

  @Column({
    enum: AssetStatus,
    default: AssetStatus.Undeployed,
  })
  @Index()
  status: AssetStatus;

  @Column({
    name: 'work_location_id',
    nullable: true,
  })
  workLocationId: number;

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.assets)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @Column({
    name: 'warranty_date',
    type: 'timestamptz',
    nullable: true,
  })
  warrantyDate?: Date;

  @Column({
    name: 'purchase_date',
    type: 'timestamptz',
    nullable: true,
  })
  purchaseDate?: Date;

  @Column({
    name: 'storage_type',
    nullable: true,
  })
  storageType?: string;

  @Column({
    name: 'storage_capacity_byte',
    type: 'bigint',
    nullable: true,
  })
  storageCapacityByte?: number;

  @Column({
    name: 'memory_type',
    nullable: true,
  })
  memoryType?: string;

  @Column({
    name: 'memory_capacity_byte',
    type: 'bigint',
    nullable: true,
  })
  memoryCapacityByte?: number;

  @Column({
    nullable: true,
  })
  processor?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  support?: SupportDetail;

  @Column({
    nullable: true,
  })
  remarks?: string;

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

  //relations

  @Column({
    name: 'project_name',
    select: false,
    nullable: true,
  })
  @Index()
  projectName: string;

  @ManyToOne(() => Project, (project) => project.assets)
  @JoinColumn({ name: 'project_name' })
  project: Project;

  @Column({
    name: 'category_id',
    nullable: true,
  })
  @Index()
  categoryId: number;

  @ManyToOne(() => AssetCategory, (category) => category.assets)
  @JoinColumn({
    name: 'category_id',
  })
  category: AssetCategory;

  @OneToMany(() => AssetAssignment, (assetAssignment) => assetAssignment.asset)
  assetAssignments: AssetAssignment[];

  @OneToMany(() => Ticket, (ticket) => ticket.asset)
  tickets: Ticket[];
}
