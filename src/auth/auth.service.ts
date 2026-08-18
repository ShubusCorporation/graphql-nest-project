import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { AuthInputDto } from './dto/auth-input.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Логика регистрации
  async register(authInput: AuthInputDto): Promise<AuthPayloadDto> {
    const { email, password } = authInput;

    // Проверяем, существует ли уже такой пользователь
    const candidate = await this.prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя в БД через Prisma
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Генерируем токен
    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return { token, user };
  }

  // 2. Логика входа (Логин)
  async login(authInput: AuthInputDto): Promise<AuthPayloadDto> {
    const { email, password } = authInput;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return { token, user };
  }
}
