import { AssetCategory } from '../../../common/enums/asset-type.enum';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsNotEmpty()
  @IsString()
  assetTag: string;

  @IsNotEmpty()
  @IsString()
  hostname: string;

  @IsNotEmpty()
  @IsString()
  category: AssetCategory;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  model?: string;

  @IsNotEmpty()
  @IsNumber()
  workLocationId: number;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsDateString()
  warrantyDate?: Date;

  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @IsNotEmpty()
  @IsNumber()
  vendorId: number;

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
}


