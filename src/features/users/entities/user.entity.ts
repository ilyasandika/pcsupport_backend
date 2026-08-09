import { Role } from '../../../common/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  username: string;

  @Column({
    nullable: true,
  })
  nik?: string;

  @Column({
    name: 'full_name',
  })
  fullName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({
    default: Role.Engineer,
  })
  role: Role;

  @Column({
    nullable: true,
    name: 'work_location_id',
  })
  workLocationId?: number;

  @Column({
    nullable: true,
    name: 'signature_path',
    type: 'varchar',
  })
  signaturePath?: string;

  @Column({
    default: true,
  })
  active: boolean;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
  })
  deletedAt?: Date;

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.users)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @OneToMany(() => Ticket, (ticket) => ticket.engineer)
  tickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  createdTickets: Ticket[];

  @OneToMany(
    () => AssetAssignment,
    (assetAssignment) => assetAssignment.createdBy,
  )
  createdAssetAssignments: AssetAssignment[];

  @OneToMany(
    () => AssetAssignment,
    (assetAssignment) => assetAssignment.assignBy,
  )
  assignedAssetAssignments: AssetAssignment[];
}
