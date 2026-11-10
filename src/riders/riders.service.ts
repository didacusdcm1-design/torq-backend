import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Filter ONLY riders
    const users = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.email ? u.email.split('@')[0] : 'Rider',
        email: u.email,
        phone: u.phone,
        isOnline: u.isOnline,
        createdAt: u.createdAt,
        rating: 4.8, 
        vehicleType: 'boda',
        totalTrips: 0, 
      })),
      meta: { total: users.length, page: 1, limit: 20, totalPages: 1 },
    };
  }
}
