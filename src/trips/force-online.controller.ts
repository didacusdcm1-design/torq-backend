import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('force-online')
export class ForceOnlineController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async forceOnline() {
    try {
      const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      if (!rider) return { message: "❌ No riders found" };

      await this.prisma.user.update({
        where: { id: rider.id },
        data: {
          isOnline: true,
          currentLat: -1.2650,
          currentLng: 36.8030,
        },
      });

      return { 
        message: "✅ Rider forcefully set ONLINE", 
        riderId: rider.id,
        phone: rider.phone
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
