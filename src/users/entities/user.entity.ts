import { ROLE } from '../../common/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: false,
  })
  username: string;

  @Column({
    name: 'full_name',
  })
  fullName: string;

  @Column({
    unique: false,
  })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({
    default: ROLE.ENGINEER,
  })
  role: ROLE;

  @Column({
    default: true,
  })
  active: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
