import { Controller, Patch, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  // TEMPORARILY PUBLIC FOR TESTING
  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string) {
    try {
      // Find a rider to assign (fallback for testing)
      const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      if (!rider) throw new NotFoundException('No rider found');

      return await this.prisma.trip.update({
        where: { id },
        data: { 
          status: 'ACCEPTED',
          riderId: rider.id 
        },
      });
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}