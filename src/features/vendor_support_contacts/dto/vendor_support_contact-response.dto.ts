import { Expose } from 'class-transformer';

export class DetailVendorSupportContactResponseDto {
  @Expose()
  id: number;
  @Expose()
  vendorId: number;
  @Expose()
  type: string;
  @Expose()
  contact: string;
}

export class VendorSupportContactResponseDto {
  @Expose()
  id: number;
  @Expose()
  type: string;
  @Expose()
  contact: string;
}