import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('seed-admin-user')
export class AdminSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // Using a completely unique phone number for the admin
      const adminPhone = '0799999999';
      
      const existing = await this.prisma.user.findUnique({ where: { phone: adminPhone } });
      if (existing) {
        return { message: "ℹ️ Admin already exists", phone: existing.phone };
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await this.prisma.user.create({
        data: {
          phone: adminPhone,
          email: 'admin@torq.com',
          password: hashedPassword,
          role: 'ADMIN',
        }
      });

      return { 
        message: "✅ Admin created successfully!", 
        phone: admin.phone,
        password: "admin123"
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
