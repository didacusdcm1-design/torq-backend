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
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        ...r,
        totalTrips: 0, // Temporary fallback so the frontend doesn't break
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
