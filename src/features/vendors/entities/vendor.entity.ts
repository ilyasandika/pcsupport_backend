import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { VendorSupportContact } from '../../vendor_support_contacts/entities/vendor_support_contact.entity';

@Entity({
  name: 'vendors',
})
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  // relations

  @OneToMany(() => Asset, (asset) => asset.vendor)
  assets: Asset[];

  @OneToMany(
    () => VendorSupportContact,
    (vendorSupportContact) => vendorSupportContact.vendor,
  )
  vendorSupportContacts: VendorSupportContact[];
}
