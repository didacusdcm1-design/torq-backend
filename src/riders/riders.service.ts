import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetRidersDto } from './dto/get-riders.dto';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetRidersDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Temporarily simplified to guarantee it works
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: data.map((r) => ({
        ...r,
        totalTrips: 0,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
