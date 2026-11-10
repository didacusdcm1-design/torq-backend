import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    // Fetch EVERYTHING to see what is actually in the database
    const users = await this.prisma.user.findMany({
      include: {
        riderProfile: true,
      },
    });

    return { data: users };
  }

  async updateStatus(id: string, status: string) {
    return { success: true };
  }
}
