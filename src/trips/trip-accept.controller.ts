import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for testing without JWT
  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }
}
