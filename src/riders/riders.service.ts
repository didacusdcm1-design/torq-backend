import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    // Fetch users who have a riderProfile and haven't been approved yet
    // Note: Assuming your schema has a `status` field in riderProfile
    const users = await this.prisma.user.findMany({
      where: { 
        role: 'RIDER',
        riderProfile: {
          isNot: null
        }
      },
      include: {
        riderProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: users };
  }

  async updateStatus(id: string, status: string) {
    // Update the RiderProfile status
    return this.prisma.riderProfile.update({
      where: { userId: id },
      data: { status: status as any },
    });
  }
}
