import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetSupportDto } from './create-asset_support.dto';

export class UpdateAssetSupportDto extends PartialType(CreateAssetSupportDto) {}
