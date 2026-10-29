import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('seed-admin-user')
export class AdminSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      const adminEmail = 'admin@torq.com';
      
      // Check if admin exists
      const existing = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (existing) {
        return { message: "ℹ️ Admin already exists", phone: existing.phone };
      }

      // Create the Admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await this.prisma.user.create({
        data: {
          phone: '0700000000',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          wallet: { create: { balance: 0 } }
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
