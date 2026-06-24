import { AssetCategory } from '../../../common/enums/asset-type.enum';
import {
  IsDateString,
  IsEnum,
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
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  model?: string;

  @IsNotEmpty()
  @IsNumber()
  workLocationId: number;

  @IsNotEmpty()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsDateString()
  warrantyDate?: Date;

  @IsOptional()
  @IsDateString()
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
}
