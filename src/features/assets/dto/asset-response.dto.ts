import { AssetCategory } from '../../../common/enums/asset-type.enum';
import { Expose, Type } from 'class-transformer';
import { AssetAssignment } from '../../asset_assignments/entities/asset_assignment.entity';
import { AssetAssignmentResponseDto } from '../../asset_assignments/dto/asset_assignment-response.dto';

export class AssetResponseDto {
  @Expose()
  id: number;

  @Expose()
  serialNumber: string;

  @Expose()
  assetTag: string;

  @Expose()
  hostname: string;

  @Expose()
  category: AssetCategory;

  @Expose()
  brand: string;

  @Expose()
  model?: string;

  @Expose()
  workLocationId: number;

  @Expose()
  warrantyDate?: Date;

  @Expose()
  purchaseDate?: Date;

  @Expose()
  projectName: string;

  @Expose()
  storageType?: string;

  @Expose()
  storageCapacityByte?: number;

  @Expose()
  memoryType?: string;

  @Expose()
  memoryCapacityByte?: number;

  @Expose()
  processor?: string;

  @Expose()
  @Type(() => AssetAssignmentResponseDto)
  assetAssignments: AssetAssignmentResponseDto[];

  createdAt: Date;
  updatedAt: Date;
}
