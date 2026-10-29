import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    // Return all trips, including those without riders (for the admin view)
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        rider: true,
      }
    });
  }
}
