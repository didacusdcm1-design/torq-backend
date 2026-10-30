import { Controller, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for testing
  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string, @Req() req: any) {
    // Find a rider to assign (fallback for testing)
    const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
    if (!rider) throw new Error("No rider found");

    return this.prisma.trip.update({
      where: { id },
      data: { 
        status: 'ACCEPTED',
        riderId: rider.id // <-- THIS IS CRITICAL
      },
    });
  }
}