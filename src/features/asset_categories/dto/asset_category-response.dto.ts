import { Expose } from 'class-transformer';

export class AssetCategoryResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
}