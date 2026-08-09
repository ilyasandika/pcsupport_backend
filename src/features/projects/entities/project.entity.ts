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
import { Asset } from '../../assets/entities/asset.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity({
  name: 'projects',
})
export class Project {
  @PrimaryColumn({
    unique: true,
  })
  name: string;

  @Column({
    name: 'vendor_id',
  })
  vendorId: number;

  @Column({
    nullable: true,
  })
  description?: string;

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

  @OneToMany(() => Asset, (asset) => asset.project)
  assets: Asset[];

  @ManyToOne(() => Vendor, (vendor) => vendor.projects)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
