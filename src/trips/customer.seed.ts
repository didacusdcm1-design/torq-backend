import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('seed-customer')
export class CustomerSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      const phone = '0711111111';
      
      const existing = await this.prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return { message: "ℹ️ Customer already exists", phone: existing.phone };
      }

      const hashedPassword = await bcrypt.hash('password123', 10);
      const customer = await this.prisma.user.create({
        data: {
          phone: phone,
          email: 'customer@torq.com',
          password: hashedPassword,
          role: 'CUSTOMER',
          wallet: { create: { balance: 0 } }
        }
      });

      return { 
        message: "✅ Customer created successfully!", 
        phone: customer.phone,
        password: "password123"
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
