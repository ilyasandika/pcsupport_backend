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
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'vendor_support_contacts',
})
export class VendorSupportContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'vendor_id',
    select: false,
  })
  vendorId: number;

  @Column()
  type: ContactType;

  @Column()
  contact: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  //relations

  @ManyToOne(() => Vendor, (vendor) => vendor.contacts)
  @JoinColumn({
    name: 'vendor_id',
  })
  vendor: Vendor;
}
