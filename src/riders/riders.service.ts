import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.rider.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async reject(id: string, reason: string) {
    // In a full production app, we would save the 'reason' in an AuditLog table
    return this.prisma.rider.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
