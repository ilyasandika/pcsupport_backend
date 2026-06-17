import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetSupportType } from '../../../common/enums/asset-support-type.enum';
import { Asset } from '../../assets/entities/asset.entity';

@Entity({
  name: 'asset_supports',
})
export class AssetSupport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'serial_number',
  })
  serialNumber: string;

  @Column({
    name: 'asset_id',
  })
  assetId: number;

  @ManyToOne(() => Asset, (asset) => asset.supports)
  @JoinColumn({
    name: 'asset_id',
  })
  asset: Asset;

  @Column()
  type: AssetSupportType;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
