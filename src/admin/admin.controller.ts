import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('dashboard-stats')
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTripsToday = await this.prisma.trip.count({
      where: { createdAt: { gte: today } }
    });

    const activeRiders = await this.prisma.user.count({
      where: { role: 'RIDER' }
    });

    const activeCustomers = await this.prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

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
}
