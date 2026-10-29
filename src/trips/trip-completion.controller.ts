import { Controller, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripCompletionController {
  constructor(private readonly prisma: PrismaService) {}

  // Public route for testing (no AuthGuard)
  @Patch('status/:id')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: status as any },
    });
  }

  @Patch('complete/:id')
  async completeTrip(@Param('id') id: string, @Body('pin') pin: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new Error('Trip not found');
    
    if (trip.pickupPin !== pin) throw new Error('Invalid PIN');

    return this.prisma.trip.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }
}
