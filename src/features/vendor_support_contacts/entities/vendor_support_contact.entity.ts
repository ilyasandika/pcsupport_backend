import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactType } from '../../../common/enums/vendor-contact-type.enum';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity({
  name: 'vendor_support_contacts',
})
export class VendorSupportContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'vendor_id',
  })
  vendorId: number;

  @Column()
  contact: string;

  @Column()
  type: ContactType;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  //relations

  @ManyToOne(() => Vendor, (vendor) => vendor.vendorSupportContacts)
  @JoinColumn({
    name: 'vendor_id',
  })
  vendor: Vendor;
}
