import { AssetSupportType } from '../../../common/enums/asset-support-type.enum';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssetSupportDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsEnum(AssetSupportType)
  @IsNotEmpty()
  type: AssetSupportType;
}
