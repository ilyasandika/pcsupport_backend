import { Expose, Type } from 'class-transformer';
import {
  AssetAssignmentResponseDto,
  DetailAssetAssignmentResponseDto,
} from '../../asset_assignments/dto/asset_assignment-response.dto';
import { AssetCategoryResponseDto } from '../../asset_categories/dto/asset_category-response.dto';
import { ProjectResponseDto } from '../../projects/dto/project-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';
import { PickType } from '@nestjs/mapped-types';
import { AssetStatus, type SupportDetail } from '../entities/asset.entity';

import { DetailWorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';

export class DetailAssetResponseDto {
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
  @Type(() => DetailWorkLocationResponseDto)
  workLocation?: DetailWorkLocationResponseDto;

  @Expose()
  type?: string;

  @Expose()
  status: AssetStatus;

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
  @Type(() => DetailAssetAssignmentResponseDto)
  assetAssignments: DetailAssetAssignmentResponseDto[];

  @Expose()
  @Type(() => ProjectResponseDto)
  project: ProjectResponseDto;

  @Expose()
  support?: SupportDetail;

  @Expose()
  @Type(() => TicketResponseDtoForAsset)
  tickets?: TicketResponseDtoForAsset[];

  @Expose()
  remarks?: string;

  @Expose()
  createdAt: Date;

  updatedAt: Date;
}

export class AssetResponseDto extends PickType(DetailAssetResponseDto, [
  'serialNumber',
  'assetTag',
  'hostname',
  'type',
  'status',
  // 'brand',
  // 'model',
  'workLocation',
  'project',
  'support',
  'category',
] as const) {
  @Expose()
  @Type(() => AssetAssignmentResponseDto)
  assetAssignment?: AssetAssignmentResponseDto | null;

  @Expose()
  isUsed: boolean;
}
