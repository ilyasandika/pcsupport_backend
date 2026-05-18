import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity({
  name: 'asset_assignments',
})
export class AssetAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'asset_id',
  })
  assetId: number;

  @Column({
    name: 'pic_employee_id',
  })
  picEmployeeId: number;

  @Column({
    name: 'user_non_employee_name',
    nullable: true,
  })
  userNonEmployeeName?: string;

  @Column({
    name: 'assigned_at',
    type: 'date',
  })
  assignedAt: Date;

  @Column({
    name: 'returned_at',
    nullable: true,
    type: 'date',
  })
  returnedAt?: Date;

  @Column({
    nullable: true,
  })
  remarks?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'is_legacy_data',
    default: false,
  })
  isLegacyData: boolean;

  @ManyToOne(() => Employee, (employee) => employee.assetAssignments)
  @JoinColumn({ name: 'pic_employee_id' })
  employee: Employee;

  @ManyToOne(() => Asset, (asset) => asset.assetAssignments)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;
}
