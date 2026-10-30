import { Controller, Patch, Param, Body, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripCancellationController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('cancel/:id')
  async cancelTrip(@Param('id') id: string, @Body() body: { cancelledBy: string, reason: string, note?: string }) {
    try {
      const trip = await this.prisma.trip.findUnique({ where: { id } });
      if (!trip) throw new Error('Trip not found');
      if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') throw new Error('Cannot cancel this trip.');

      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'CANCELLED'::"TripStatus", "cancelledBy" = ${body.cancelledBy}, "cancellationReason" = ${body.reason}, "cancellationNote" = ${body.note || null}
        WHERE "id" = ${id}
      `;
      return { success: true, message: 'Trip cancelled' };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
