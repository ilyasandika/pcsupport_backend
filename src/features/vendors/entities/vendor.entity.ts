import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ExternalTicket } from '../../external_tickets/entities/external_ticket.entity';

export interface VendorContact {
  type: string;
  value: string;
}

@Entity({
  name: 'vendors',
})
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('json', { nullable: true })
  contacts: VendorContact[];

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

  // relations
  @OneToMany(() => ExternalTicket, (externalTicket) => externalTicket.vendor)
  externalTickets: ExternalTicket[];

  @OneToMany(() => Project, (project) => project.vendor)
  projects: Project[];
}
