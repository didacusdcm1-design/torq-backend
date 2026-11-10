import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    // Removed the 'role: RIDER' filter so we catch everyone with a profile
    const users = await this.prisma.user.findMany({
      where: { 
        riderProfile: {
          isNot: null,
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
    let rejectionReason = null;
    
    if (status === 'REJECTED') {
      rejectionReason = 'Rejected by Admin';
    }

    return this.prisma.riderProfile.update({
      where: { userId: id },
      data: { rejectionReason },
    });
  }
}
