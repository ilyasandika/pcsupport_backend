import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  nik?: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty({
    message: 'Role is required',
  })
  @IsEnum(Role)
  role: Role;

  @IsNotEmpty({
    message: 'Work Location is required',
  })
  @IsNumber(
    {},
    {
      message: 'Work Location must sends an ID as number',
    })
  workLocationId: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
