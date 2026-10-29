import { Controller, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  // Public route for testing
  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }
}
