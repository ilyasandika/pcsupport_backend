import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';

export class DetailUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  role: Role;

  @Expose()
  active: boolean;
}

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  role: Role;
}