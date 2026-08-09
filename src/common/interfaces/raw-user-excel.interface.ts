import { Role } from '../enums/role.enum';

export interface RawUserExcelRow {
  full_name: string;
  username: string;
  password: string;
  email: string;
  nik?: string;
  role: Role;
  work_location_id: number;
}
