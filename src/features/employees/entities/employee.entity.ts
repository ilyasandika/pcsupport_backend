import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeContractType } from '../../../common/enums/contract-type.enum';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { WorkLocation } from '../../work-locations/entities/work-location.entity';

@Entity({
  name: 'employees',
})
export class Employee {
  @PrimaryColumn()
  nik: string;

  @Column()
  name: string;

  @Column({
    name: 'contract_type',
  })
  contractType: EmployeeContractType;

  @Column()
  position: string;

  @Column({
    name: 'position_id',
  })
  positionId: string;

  @Column()
  fs: string;

  @Column()
  mjl: string;

  @Column()
  bod: string;

  @Column()
  religion: string;

  @Column()
  directorate: string;

  @Column()
  division: string;

  @Column()
  department: string;

  @Column({
    nullable: true,
  })
  workLocationId: number;

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.employees)
  workLocation: WorkLocation;

  @Column()
  status?: boolean;

  @Column({
    name: 'retire_date',
  })
  retireDate?: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
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
