import { Controller, Patch, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripCompletionController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('complete/:id')
  async completeTrip(@Param('id') id: string, @Body('pin') pin: string) {
    // 1. Find the trip
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // 2. Verify the PIN
    if (trip.pickupPin !== pin) {
      throw new BadRequestException('Invalid Pickup PIN');
    }

    // 3. Update status to COMPLETED
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }
  @Patch('status/:id')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
