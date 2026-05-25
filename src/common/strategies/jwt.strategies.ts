import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../features/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findOne(payload.sub as number);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    } as JwtPayload;
  }
}
