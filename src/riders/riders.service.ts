import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // The absolute simplest query possible
    const users = await this.prisma.user.findMany();

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.email ? u.email.split('@')[0] : 'Rider',
        email: u.email,
        phone: u.phone,
        isOnline: u.isOnline,
        createdAt: u.createdAt,
        rating: 4.8, // Hardcoded for now
        vehicleType: 'boda', // Hardcoded for now
        totalTrips: 0, // Hardcoded for now
      })),
      meta: { total: users.length, page: 1, limit: 20, totalPages: 1 },
    };
  }
}
