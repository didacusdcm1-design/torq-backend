import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      const riders = [
        { firstName: 'Chadrick', lastName: 'Didacus', email: 'rider@torq.com', phone: '0712345678', status: 'APPROVED' },
        { firstName: 'John', lastName: 'Doe', email: 'john@torq.com', phone: '0722334455', status: 'PENDING' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@torq.com', phone: '0733445566', status: 'REJECTED' },
      ];

      for (const r of riders) {
        await this.prisma.rider.upsert({
          where: { email: r.email },
          update: {},
          create: r,
        });
      }

      const count = await this.prisma.rider.count();
      return { 
        message: "✅ Seeded successfully!", 
        totalRidersInDB: count 
      };
    } catch (error: any) { // <-- The fix is adding ': any' here
      return { 
        message: "❌ Seeding failed", 
        error: error?.message || String(error) // <-- Safe extraction
      };
    }
  }
}
