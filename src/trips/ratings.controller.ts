import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getRiderRatings() {
    const riders = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: {
        riderTrips: { where: { rating: { not: null } }, select: { rating: true } },
        riderProfile: true
      }
    });

    return riders.map(rider => {
      const ratings = rider.riderTrips.map(t => t.rating!);
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 ? ratings.reduce((a, b) => a + b, 0) / totalRatings : 0;

      return {
        id: rider.id,
        name: rider.riderProfile?.fullName || rider.phone,
        phone: rider.phone,
        totalTrips: rider.riderTrips.length,
        totalRatings: totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    });
  }
}
