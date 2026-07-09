import { AssetSupportType } from '../../../common/enums/asset-support-type.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAssetSupportDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  assetSn: string;

  @IsEnum(AssetSupportType)
  @IsNotEmpty()
  type: AssetSupportType;
}
