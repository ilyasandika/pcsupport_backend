import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VendorSupportContact } from '../../vendor_support_contacts/entities/vendor_support_contact.entity';
import { Project } from '../../projects/entities/project.entity';
import { ExternalTicket } from '../../external_tickets/entities/external_ticket.entity';

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
  @OneToMany(
    () => VendorSupportContact,
    (vendorSupportContact) => vendorSupportContact.vendor,
  )
  contacts: VendorSupportContact[];

  @OneToMany(() => ExternalTicket, (externalTicket) => externalTicket.vendor)
  externalTickets: ExternalTicket[];

  @OneToMany(() => Project, (project) => project.vendor)
  projects: Project[];
}
