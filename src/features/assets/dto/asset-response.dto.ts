import { Expose, Type } from 'class-transformer';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { AssetAssignmentResponseDto } from '../../asset_assignments/dto/asset_assignment-response.dto';
import { AssetSupportResponseDto } from '../../asset_supports/dto/asset_support-response.dto';
import { AssetCategoryResponseDto } from '../../asset_categories/dto/asset_category-response.dto';
import { ProjectResponseDto } from '../../projects/dto/project-response.dto';

export class DetailAssetResponseDto {
  @Expose()
  id: number;

  @Expose()
  serialNumber: string;

  @Expose()
  assetTag: string;

  @Expose()
  hostname: string;

  @Expose()
  @Type(() => AssetCategoryResponseDto)
  category: AssetCategoryResponseDto;

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
  @Type(() => WorkLocationResponseDto)
  workLocation: WorkLocationResponseDto;

  @Expose()
  @Type(() => AssetSupportResponseDto)
  supports: AssetSupportResponseDto[];

  @Expose()
  @Type(() => AssetAssignmentResponseDto)
  assetAssignment: AssetAssignmentResponseDto;

  @Expose()
  @Type(() => ProjectResponseDto)
  project: ProjectResponseDto;

  createdAt: Date;
  updatedAt: Date;
}

export class AssetResponseDto {
  @Expose()
  serialNumber: string;
  @Expose()
  assetTag: string;
  @Expose()
  hostname: string;
  @Expose()
  @Type(() => AssetCategoryResponseDto)
  category: AssetCategoryResponseDto;
  @Expose()
  @Type(() => AssetAssignmentResponseDto)
  assetAssignment: AssetAssignmentResponseDto;
}
