import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  Ticket = 'ticket',
  BastAssign = 'bast_assign',
  BastReturn = 'bast_return',
  BastBackup = 'bast_backup',
}

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TemplateType,
    name: 'type',
    unique: true,
  })
  type: TemplateType;

  @Column()
  name: string;

  @Column({
    name: 'file_path',
  })
  filePath: string;


  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
