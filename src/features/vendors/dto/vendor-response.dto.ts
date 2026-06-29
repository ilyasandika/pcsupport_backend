import { Expose } from 'class-transformer';

export class VendorResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
}
