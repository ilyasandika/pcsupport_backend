import {
  Column,
  CreateDateColumn,
  Entity, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('work_locations')
export class WorkLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'double precision',
  })
  longitude: number;

  @Column({
    type: 'double precision',
  })
  latitude: number;

  @Column()
  address: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  //relation

  @OneToMany(() => Asset, (asset) => asset.workLocation)
  assets: Asset[];

  @OneToMany(() => Ticket, (ticket) => ticket.location)
  tickets: Ticket[];

  @OneToMany(() => User, (user) => user.workLocation)
  users: User;

  @OneToMany(() => Employee, (employee) => employee.workLocation)
  employees: Employee[];
}
