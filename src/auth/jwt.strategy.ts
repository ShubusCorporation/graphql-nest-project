import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Автоматически вырезает слово 'Bearer ' из заголовка
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key',
    });
  }

  // Метод вызывается автоматически, если токен валидный.
  // То, что мы вернем отсюда, NestJS положит в объект req.user
  async validate(payload: { id: number; email: string }) {
    return { id: payload.id, email: payload.email };
  }
}
