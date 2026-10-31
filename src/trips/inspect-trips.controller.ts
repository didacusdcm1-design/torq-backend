import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('inspect-trips')
export class InspectTripsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async inspect() {
    const trips = await this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        customerId: true,
        riderId: true,
        createdAt: true
      }
    });
    
    const customers = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, phone: true }
    });

    return { recentTrips: trips, registeredCustomers: customers };
  }
}
