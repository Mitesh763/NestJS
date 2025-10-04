import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = req.headers['authorization'].split(' ')[1];

    const isValid = await this.authService.isTokenValid(payload.id, token);

    if (!isValid)
      throw new UnauthorizedException('Token is invalid or revoked');

    const user = await this.authService.findById(payload.id);

    return user;
  }
}
