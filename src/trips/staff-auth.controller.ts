import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth/staff')
export class StaffAuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    const staff = await this.prisma.staff.findUnique({ where: { email: body.email } });
    
    if (!staff || !staff.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    // FIX: Ensure password exists before comparing
    if (!staff.password) {
      throw new UnauthorizedException('Account password not set. Please contact Super Admin.');
    }

    const isMatch = await bcrypt.compare(body.password, staff.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: staff.id, email: staff.email, role: staff.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: staff.id, name: staff.name, email: staff.email, role: staff.role }
    };
  }
}
