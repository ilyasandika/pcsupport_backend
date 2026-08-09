import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string | number;
  username: string;
  role: Role;
  fullName: string;
}
