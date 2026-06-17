import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';

@Entity({
  name: 'projects',
})
export class Project {
  @PrimaryColumn()
  name: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(() => Asset, (asset) => asset.project)
  assets: Asset[];
}

