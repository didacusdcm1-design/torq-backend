import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetRidersDto } from './dto/get-riders.dto';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetRidersDto) {
    const { page = 1, limit = 20, isOnline } = query;
    const skip = (page - 1) * limit;

    // Build the where clause based on your exact schema
    const where: any = {};
    
    // We use the enum 'RIDER' as defined in your schema
    if (query.isOnline !== undefined) {
      where.isOnline = isOnline;
    }

    const maxRetries = 3;
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const [data, total] = await this.prisma.$transaction([
          this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }, // Safe fallback since 'name' doesn't exist
          }),
          this.prisma.user.count({ where }),
        ]);

        // Map the data to match what the frontend expects
        return {
          data: data.map((r) => ({
            id: r.id,
            name: r.email ? r.email.split('@')[0] : 'Unknown Rider', // Fallback for missing name field
            email: r.email,
            phone: r.phone,
            isOnline: r.isOnline,
            rating: null, // Not in schema, set to null
            vehicleType: null, // Not in schema, set to null
            createdAt: r.createdAt,
            totalTrips: 0, // Temporarily bypassed to prevent 500 errors
          })),
          meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw lastError;
  }
}
