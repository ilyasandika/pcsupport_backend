import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AssetCategory } from '../../../common/enums/asset-type.enum';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { VendorSupportContact } from '../../vendor_support_contacts/entities/vendor_support_contact.entity';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity({
  name: 'assets',
})
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
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

  @Column()
  category: AssetCategory;

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
    name: 'project_name',
  })
  projectName?: string;

  @Column({
    name: 'warranty_date',
  })
  warrantyDate?: Date;

  @Column({
    name: 'purchase_date',
  })
  purchaseDate?: Date;

  @Column({
    name: 'vendor_id',
    select: false,
  })
  vendorId: number;

  @Column({
    name: 'storage_type',
  })
  storageType?: string;

  @Column({
    name: 'storage_capacity_byte',
  })
  storageCapacityByte?: number;

  @Column({
    name: 'memory_type',
  })
  memoryType?: string;

  @Column({
    name: 'memory_capacity_byte',
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

  @ManyToOne(() => Vendor, (vendor) => vendor.assets)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(() => AssetAssignment, (assetAssignment) => assetAssignment.asset)
  assetAssignments: AssetAssignment[];

  @OneToMany(() => Ticket, (ticket) => ticket.asset)
  tickets: Ticket[];
}
