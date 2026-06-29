import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetCategoryDto } from './create-asset_category.dto';

export class UpdateAssetCategoryDto extends PartialType(CreateAssetCategoryDto) {}
