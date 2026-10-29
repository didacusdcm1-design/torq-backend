import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    // Fetch users who have the RIDER role
    return this.prisma.user.findMany({
      where: { 
        role: 'RIDER',
        ...(search ? { OR: [{ phone: { contains: search } }, { email: { contains: search } }] } : {})
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reject(id: string, reason: string) {
    // Demote back to customer
    return this.prisma.user.update({
      where: { id },
      data: { role: 'CUSTOMER' },
    });
  }
}
