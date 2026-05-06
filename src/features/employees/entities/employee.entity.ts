import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeContractType } from '../../../common/enums/contract-type.enum';

@Entity({
  name: 'employees',
})
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'employee_id',
    unique: true,
  })
  employeeId: string;

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
}
