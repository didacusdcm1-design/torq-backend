import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard-stats')
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalTripsToday = await this.prisma.trip.count({ where: { createdAt: { gte: today } } });
    const activeRiders = await this.prisma.user.count({ where: { role: 'RIDER' } });
    const activeCustomers = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
    const revenueToday = await this.prisma.trip.aggregate({
      where: { createdAt: { gte: today }, status: 'COMPLETED' },
      _sum: { estimatedFare: true }
    });
    return {
      totalTripsToday,
      activeRiders,
      activeCustomers,
      revenueToday: revenueToday._sum.estimatedFare || 0,
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true }
    });
  }
}
