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

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const { username, password } = dto;
    const user = await this.userService.findForLogin(username);

    if (!user) {
      throw new UnauthorizedException('wrong username or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('wrong username or password');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
