import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(phone: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(phone: string, pass: string) {
    const user = await this.validateUser(phone, pass);
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, phone: user.phone, role: user.role }
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'CUSTOMER',
        wallet: { create: { balance: 0 } } // Fixed: Removed pendingEarnings
      }
    });
  }
}
