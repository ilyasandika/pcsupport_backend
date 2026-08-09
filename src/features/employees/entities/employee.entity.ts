import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';

@Entity({
  name: 'employees',
})
export class Employee {
  @PrimaryColumn()
  nik: string;

  @Column({
    name: 'nik2',
    nullable: true,
  })
  nik2?: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  position?: string;

  @Column({
    name: 'position_id',
    nullable: true,
  })
  positionId?: string;

  @Column({
    nullable: true,
  })
  fs?: string;

  @Column({
    nullable: true,
  })
  mjl?: string;

  @Column({
    nullable: true,
  })
  bod?: string;

  @Column({
    nullable: true,
  })
  religion?: string;

  @Column({
    nullable: true,
  })
  directorate?: string;

  @Column({
    nullable: true,
  })
  division?: string;

  @Column({
    nullable: true,
  })
  department?: string;

  @Column({
    name: 'work_location_id',
  })
  workLocationId: number;

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.employees)
  @JoinColumn({ name: 'work_location_id' })
  workLocation: WorkLocation;

  @Column({
    nullable: true,
  })
  status?: string;

  @Column({
    name: 'retire_date',
    type: 'timestamptz',
    nullable: true,
  })
  retireDate?: Date;

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

  @OneToMany(
    () => AssetAssignment,
    (assetAssignment) => assetAssignment.employee,
  )
  assetAssignments: AssetAssignment[];

  @OneToMany(() => Ticket, (ticket) => ticket.employee)
  tickets: Ticket[];
}
