import {
  AssetStatus,
  SupportType,
} from '../../features/assets/entities/asset.entity';

export interface RawAssetExcelRow {
  assettag: string;
  hostname?: string;
  sn?: string;
  category_id?: string | number;
  category?: string | number;
  type?: string;
  project: string;
  support_sn?: string;
  support_type?: SupportType;
  support_name?: string;
  status: AssetStatus;
  purchase_date?: string;
  warranty_date?: string;
  storage_type?: string;
  storage_capacity_byte?: string;
  memory_type?: string;
  memory_capacity_byte?: string;
  processor?: string;
  work_location_id?: string | number;
  work_location?: string | number;
  location_id?: string | number;
  location?: string | number;
}
