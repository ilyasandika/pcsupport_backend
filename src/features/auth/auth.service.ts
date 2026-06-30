import { Injectable, UnauthorizedException } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { username, password } = dto;
    const user = await this.userService.findForLogin(username);

    if (!user) {
      throw new UnauthorizedException('wrong username or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('wrong username or password');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        username: user.username,
        role: user.role,
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    };
  }
}
