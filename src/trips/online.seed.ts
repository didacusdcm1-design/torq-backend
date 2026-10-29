import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed-online')
export class OnlineSeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async seed() {
    try {
      // Find the first rider in the database
      const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      if (!rider) {
        return { message: "❌ No riders found in database. Please seed riders first." };
      }

      // Put them online near Westlands, Nairobi
      const updated = await this.prisma.user.update({
        where: { id: rider.id },
        data: {
          isOnline: true,
          currentLat: -1.2650, // Near your pickup point
          currentLng: 36.8030,
        }
      });

      return { 
        message: "✅ Rider is now online!", 
        riderId: updated.id,
        phone: updated.phone,
        location: { lat: updated.currentLat, lng: updated.currentLng }
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
