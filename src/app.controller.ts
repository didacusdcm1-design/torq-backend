import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

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
      // Fetch real counts from your database using Prisma
      // (Note: Change 'rider', 'customer', 'trip' to match your actual schema models)
      
      const activeRiders = await this.prisma.rider.count({ where: { status: 'ACTIVE' } }).catch(() => 0);
      const activeCustomers = await this.prisma.customer.count({ where: { status: 'ACTIVE' } }).catch(() => 0);
      
      const completedTrips = await this.prisma.trip.count({ where: { status: 'COMPLETED' } }).catch(() => 0);
      const inProgressTrips = await this.prisma.trip.count({ where: { status: 'IN_PROGRESS' } }).catch(() => 0);
      const pendingTrips = await this.prisma.trip.count({ where: { status: 'PENDING' } }).catch(() => 0);
      const cancelledTrips = await this.prisma.trip.count({ where: { status: 'CANCELLED' } }).catch(() => 0);

      return {
        stats: {
          totalTrips: completedTrips + inProgressTrips + pendingTrips,
          activeRiders: activeRiders,
          activeCustomers: activeCustomers,
          totalRevenue: 0, // You can sum this from a payment table later
          averageRating: 0 // You can average this from a review table later
        },
        tripStatus: {
          completed: completedTrips,
          inProgress: inProgressTrips,
          pending: pendingTrips,
          cancelled: cancelledTrips
        },
        revenueChart: [
          // You'll want to run a groupBy query here to get real revenue
          { date: "Apr 19", amount: 0 },
          { date: "Apr 20", amount: 0 },
          { date: "Apr 21", amount: 0 }
        ]
      };
    } catch (error) {
      console.error("Database Error:", error);
      // If the DB fails, return 0s so the frontend doesn't crash
      return {
        stats: { totalTrips: 0, activeRiders: 0, activeCustomers: 0, totalRevenue: 0, averageRating: 0 },
        tripStatus: { completed: 0, inProgress: 0, pending: 0, cancelled: 0 },
        revenueChart: []
      };
    }
  }
}
