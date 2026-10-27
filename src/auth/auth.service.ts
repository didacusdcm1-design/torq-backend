import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const dummyPhone = dto.email.split('@')[0] + Date.now().toString().slice(-4);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        phone: dummyPhone, 
        role: (dto as any).role || 'CUSTOMER',
        // Create a wallet for every new user
        wallet: { create: { balance: 0, pendingEarnings: 0 } }
      },
    });

    return this.login({ email: user.email!, password: dto.password });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
