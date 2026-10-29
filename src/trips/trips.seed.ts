import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed-trip')
export class TripSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // Create a dummy customer user first so the foreign key doesn't fail
      const customer = await this.prisma.user.create({
        data: {
          phoneNumber: '0700000000',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'CUSTOMER',
        }
      });

      // Create the dummy trip using your EXACT schema fields
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
