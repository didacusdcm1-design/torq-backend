import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { Role, TripStatus } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/admin/dashboard')
  async getDashboardStats() {
    try {
      const activeRiders = await this.prisma.user.count({ where: { role: Role.RIDER, isOnline: true } }).catch(() => 0);
      const activeCustomers = await this.prisma.user.count({ where: { role: Role.CUSTOMER } }).catch(() => 0);
      
      const completedTrips = await this.prisma.trip.count({ where: { status: TripStatus.COMPLETED } }).catch(() => 0);
      const inProgressTrips = await this.prisma.trip.count({ where: { status: { in: [TripStatus.IN_PROGRESS, TripStatus.IN_PROGRESS_DEST, TripStatus.ACCEPTED, TripStatus.ARRIVED_AT_PICKUP] } } }).catch(() => 0);
      const pendingTrips = await this.prisma.trip.count({ where: { status: TripStatus.REQUESTED } }).catch(() => 0);
      const cancelledTrips = await this.prisma.trip.count({ where: { status: TripStatus.CANCELLED } }).catch(() => 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const revenueData = await this.prisma.trip.aggregate({
        _sum: { finalFare: true },
        where: { status: TripStatus.COMPLETED, createdAt: { gte: today } }
      }).catch(() => ({ _sum: { finalFare: 0 } }));

      const ratingData = await this.prisma.trip.aggregate({
        _avg: { rating: true },
        where: { status: TripStatus.COMPLETED, rating: { not: null } }
      }).catch(() => ({ _avg: { rating: 0 } }));

      return {
        stats: {
          totalTrips: completedTrips + inProgressTrips + pendingTrips,
          activeRiders: activeRiders,
          activeCustomers: activeCustomers,
          totalRevenue: revenueData._sum.finalFare || 0,
          averageRating: ratingData._avg.rating ? Number(ratingData._avg.rating.toFixed(1)) : 0
        },
        tripStatus: { 
          completed: completedTrips, 
          inProgress: inProgressTrips, 
          pending: pendingTrips, 
          cancelled: cancelledTrips 
        },
        revenueChart: []
      };
    } catch (error) {
      return { 
        stats: { totalTrips: 0, activeRiders: 0, activeCustomers: 0, totalRevenue: 0, averageRating: 0 }, 
        tripStatus: { completed: 0, inProgress: 0, pending: 0, cancelled: 0 }, 
        revenueChart: [] 
      };
    }
  }
}