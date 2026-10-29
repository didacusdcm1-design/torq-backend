import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed-trip')
export class TripSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // 1. Create a dummy customer using your exact User schema
      const customer = await this.prisma.user.create({
        data: {
          phone: '0700000000',
          email: 'customer@torq.com',
          role: 'CUSTOMER',
        }
      });

      // 2. Create the dummy trip using your exact Trip schema
      const trip = await this.prisma.trip.create({
        data: {
          pickupLat: -1.2635, 
          pickupLng: 36.8027,
          dropoffLat: -1.3192, 
          dropoffLng: 36.9276,
          estimatedFare: 1500.00,
          finalFare: 1500.00,
          status: 'COMPLETED',
          customerId: customer.id,
        }
      });

      return { 
        message: "✅ Trip seeded successfully!", 
        tripId: trip.id,
        note: "Go to /trips in Vercel and click the row to see the details!" 
      };
    } catch (error: any) {
      return { message: "❌ Seeding failed", error: error.message };
    }
  }
}
