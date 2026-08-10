import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AssetStatus, SupportType } from '../entities/asset.entity';
import { Type } from 'class-transformer';

class SupportDetail {
  @IsEnum(SupportType)
  @IsNotEmpty()
  type: SupportType;

  @IsString()
  @IsNotEmpty()
  sn: string;
}
export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  assetTag: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @IsOptional()
  warrantyDate?: Date;

  @IsOptional()
  purchaseDate?: Date;

  @IsOptional()
  @IsString()
  storageType?: string;

  @IsOptional()
  @IsNumber()
  storageCapacityByte?: number;

  @IsOptional()
  @IsString()
  memoryType?: string;

  @IsOptional()
  @IsNumber()
  memoryCapacityByte?: number;

  @IsOptional()
  @IsString()
  processor?: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SupportDetail)
  support?: SupportDetail;

  @IsOptional()
  @IsNumber()
  workLocationId?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
