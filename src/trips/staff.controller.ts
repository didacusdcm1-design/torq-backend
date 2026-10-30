import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

@Controller('staff')
export class StaffController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getStaff() {
    return this.prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createStaff(@Body() body: any) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.prisma.staff.create({
      data: { name: body.name, email: body.email, role: body.role, password: hashedPassword }
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/toggle')
  async toggleStaff(@Param('id') id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new Error('Staff not found');
    return this.prisma.staff.update({ where: { id }, data: { isActive: !staff.isActive } });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/password')
  async updatePassword(@Param('id') id: string, @Body('password') newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.staff.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }

  @Get('seed')
  async seedStaff() {
    const existing = await this.prisma.staff.count();
    if (existing > 0) return { message: "Staff already exist." };
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.staff.createMany({
      data: [
        { name: "Alice Wanjiku", email: "alice@torq.co.ke", role: "OPERATIONS_MANAGER", password: hashedPassword },
        { name: "Bob Otieno", email: "bob@torq.co.ke", role: "FINANCE_OFFICER", password: hashedPassword },
        { name: "Charlie Mwangi", email: "charlie@torq.co.ke", role: "SUPPORT_OFFICER", password: hashedPassword }
      ]
    });
    return { message: "✅ 3 Dummy staff members created with password: admin123" };
  }
}
