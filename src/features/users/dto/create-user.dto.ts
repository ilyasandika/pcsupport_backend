import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
