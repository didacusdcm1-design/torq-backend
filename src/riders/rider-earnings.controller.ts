import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('riders')
export class RiderEarningsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':riderId/earnings')
  async getRiderEarnings(@Param('riderId') riderId: string) {
    // 1. Fetch completed trips for this rider
    // (Adjust the 'status' field if your database uses a different string like 'COMPLETED')
    const trips = await this.prisma.trip.findMany({
      where: {
        riderId: riderId,
        status: 'COMPLETED', 
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Calculate totals
    let totalGross = 0;
    trips.forEach(trip => {
      // Assume your trip table has a 'price' or 'fare' column. 
      // If it's named differently, change 'price' to match your schema.
      totalGross += trip.price || 0; 
    });

    // Assuming TORQ takes 20% commission
    const commissionRate = 0.20;
    const totalCommission = totalGross * commissionRate;
    const netEarnings = totalGross - totalCommission;

    return {
      totalGross,
      totalCommission,
      netEarnings,
      totalTrips: trips.length,
      recentTrips: trips.slice(0, 10), // Only send the 10 most recent to the UI
    };
  }
}