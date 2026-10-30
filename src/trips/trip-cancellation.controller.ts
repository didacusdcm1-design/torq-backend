import { Controller, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripCancellationController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('cancel/:id')
  async cancelTrip(
    @Param('id') id: string, 
    @Body() body: { cancelledBy: string, reason: string, note?: string }
  ) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    
    if (!trip) throw new BadRequestException('Trip not found');
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled trip.');
    }

    // Update the trip with cancellation data
    return this.prisma.trip.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: body.cancelledBy, // 'RIDER' or 'CUSTOMER'
        cancellationReason: body.reason,
        cancellationNote: body.note || null,
      },
    });
  }
}
