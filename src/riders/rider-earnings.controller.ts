import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('riders')
export class RiderEarningsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':riderId/earnings')
  async getRiderEarnings(@Param('riderId') riderId: string) {
    const trips = await this.prisma.trip.findMany({
      where: {
        riderId: riderId,
        status: 'COMPLETED', 
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalGross = 0;
    trips.forEach(trip => {
      // Use finalFare if it exists, otherwise fallback to estimatedFare
      totalGross += trip.finalFare || trip.estimatedFare || 0; 
    });

    const commissionRate = 0.20;
    const totalCommission = totalGross * commissionRate;
    const netEarnings = totalGross - totalCommission;

    // Map the recent trips so the Flutter app gets the right field names
    const formattedTrips = trips.slice(0, 10).map(trip => ({
      id: trip.id,
      // Since we don't have text addresses, use coordinates as the location string
      pickupLocation: `${trip.pickupLat.toFixed(4)}, ${trip.pickupLng.toFixed(4)}`,
      dropoffLocation: `${trip.dropoffLat.toFixed(4)}, ${trip.dropoffLng.toFixed(4)}`,
      price: trip.finalFare || trip.estimatedFare || 0,
      createdAt: trip.createdAt,
    }));

    return {
      totalGross,
      totalCommission,
      netEarnings,
      totalTrips: trips.length,
      recentTrips: formattedTrips, 
    };
  }
}