import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetRidersDto } from './dto/get-riders.dto';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetRidersDto) {
    const { page = 1, limit = 20, isOnline, sortBy = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      role: 'RIDER' as const,
      ...(isOnline !== undefined ? { isOnline } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isOnline: true,
          rating: true,
          vehicleType: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        ...r,
        totalTrips: r._count.trips,
        _count: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
