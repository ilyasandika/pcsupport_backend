import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetCategory as AssetCategoryType } from '../../../common/enums/asset-type.enum';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { AssetSupport } from '../../asset_supports/entities/asset_support.entity';
import { Project } from '../../projects/entities/project.entity';
import { AssetCategory } from '../../asset_categories/entities/asset_category.entity';

@Entity({
  name: 'assets',
})
export class Asset {
  @PrimaryColumn({
    name: 'serial_number',
    unique: true,
  })
  serialNumber: string;

  @Column({
    name: 'asset_tag',
    unique: true,
  })
  assetTag: string;

  @Column()
  hostname: string;

  @Column({
    name: 'category_id',
    nullable: true,
  })
  categoryId: number;

  @Column()
  brand: string;

  @Column()
  model?: string;

  @Column({
    name: 'work_location_id',
    select: false,
  })
  workLocationId: number;

  @Column({
    name: 'warranty_date',
  })
  warrantyDate?: Date;

  @Column({
    name: 'purchase_date',
  })
  purchaseDate?: Date;

  @Column({
    name: 'project_id',
    select: false,
    nullable: true,
  })
  projectId: number;

  @Column({
    name: 'storage_type',
  })
  storageType?: string;

  @Column({
    name: 'storage_capacity_byte',
    type: 'bigint',
  })
  storageCapacityByte?: number;

  @Column({
    name: 'memory_type',
  })
  memoryType?: string;

  @Column({
    name: 'memory_capacity_byte',
    type: 'bigint',
  })
  memoryCapacityByte?: number;

  @Column()
  processor?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  //relations

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.assets)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @ManyToOne(() => Project, (project) => project.assets)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => AssetAssignment, (assetAssignment) => assetAssignment.asset)
  assetAssignments: AssetAssignment[];

  @OneToMany(() => Ticket, (ticket) => ticket.asset)
  tickets: Ticket[];

  @OneToMany(() => AssetSupport, (support) => support.asset)
  supports: AssetSupport[];

  @ManyToOne(() => AssetCategory, (category) => category.assets)
  @JoinColumn({
    name: 'category_id',
  })
  category: AssetCategory;
}
