import { Controller, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripRatingController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch(':id/rate')
  async rateTrip(@Param('id') id: string, @Body() body: { rating: number, feedback?: string }) {
    if (body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new BadRequestException('Trip not found');
    if (trip.status !== 'COMPLETED') throw new BadRequestException('Can only rate completed trips');
    if (trip.rating) throw new BadRequestException('Trip already rated');

    return this.prisma.trip.update({
      where: { id },
      data: { 
        rating: body.rating,
        // If you had a feedback field in the schema, you would save it here
      },
    });
  }
}
