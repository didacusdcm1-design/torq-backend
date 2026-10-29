import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed-trip')
export class TripSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // Create a dummy trip with financials
      const trip = await this.prisma.trip.create({
        data: {
          bookingRef: "TRQ-8492A",
          status: "COMPLETED",
          pickupLat: -1.2635, // Westlands
          pickupLng: 36.8027,
          destLat: -1.3192, // JKIA
          destLng: 36.9276,
          grossFare: 1500.00,
          finalFare: 1500.00,
          customerId: "cust-123",
          riderId: "rider-123",
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
