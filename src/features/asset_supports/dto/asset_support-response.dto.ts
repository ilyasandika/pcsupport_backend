import { Expose } from 'class-transformer';
import { AssetSupportType } from '../../../common/enums/asset-support-type.enum';

export class AssetSupportResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: number;

  @Expose()
  type: AssetSupportType;
}