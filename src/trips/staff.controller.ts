import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getStaff() {
    return this.prisma.staff.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  async createStaff(@Body() body: any) {
    return this.prisma.staff.create({
      data: { name: body.name, email: body.email, role: body.role }
    });
  }

  @Patch(':id/toggle')
  async toggleStaff(@Param('id') id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new Error('Staff not found');
    return this.prisma.staff.update({ where: { id }, data: { isActive: !staff.isActive } });
  }

  @Get('seed')
  async seedStaff() {
    const existing = await this.prisma.staff.count();
    if (existing > 0) return { message: "Staff already exist." };
    await this.prisma.staff.createMany({
      data: [
        { name: "Alice Wanjiku", email: "alice@torq.co.ke", role: "OPERATIONS_MANAGER" },
        { name: "Bob Otieno", email: "bob@torq.co.ke", role: "FINANCE_OFFICER" },
        { name: "Charlie Mwangi", email: "charlie@torq.co.ke", role: "SUPPORT_OFFICER" }
      ]
    });
    return { message: "✅ 3 Dummy staff members created!" };
  }
}
