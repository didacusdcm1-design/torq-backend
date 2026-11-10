import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    // Find riders where rejectionReason is null (meaning they are pending or approved)
    const users = await this.prisma.user.findMany({
      where: { 
        role: 'RIDER',
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
    
    // If rejected, we save a reason. If approved, we clear the reason.
    if (status === 'REJECTED') {
      rejectionReason = 'Rejected by Admin';
    }

    return this.prisma.riderProfile.update({
      where: { userId: id },
      data: { rejectionReason },
    });
  }
}
