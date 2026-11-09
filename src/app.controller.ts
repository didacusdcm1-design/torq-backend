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
      // 1. Fetch real counts from the User model based on Role
      const activeRiders = await this.prisma.user.count({ 
        where: { role: Role.RIDER, isOnline: true } 
      }).catch(() => 0);
      
      const activeCustomers = await this.prisma.user.count({ 
        where: { role: Role.CUSTOMER } 
      }).catch(() => 0);
      
      // 2. Fetch trips for the pie chart using the correct TripStatus Enums
      const completedTrips = await this.prisma.trip.count({ 
        where: { status: TripStatus.COMPLETED } 
      }).catch(() => 0);
      
      const inProgressTrips = await this.prisma.trip.count({ 
        where: { status: { in: [TripStatus.IN_PROGRESS, TripStatus.IN_PROGRESS_DEST, TripStatus.ACCEPTED, TripStatus.ARRIVED_AT_PICKUP] } } 
      }).catch(() => 0);
      
      const pendingTrips = await this.prisma.trip.count({ 
        where: { status: TripStatus.REQUESTED } // 'REQUESTED' is your equivalent of Pending
      }).catch(() => 0);
      
      const cancelledTrips = await this.prisma.trip.count({ 
        where: { status: TripStatus.CANCELLED } 
      }).catch(() => 0);

      // 3. Calculate today's revenue using the correct 'finalFare' field
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const revenueData = await this.prisma.trip.aggregate({
        _sum: { finalFare: true },
        where: { 
          status: TripStatus.COMPLETED,
          createdAt: { gte: today }
        }
      }).catch(() => ({ _sum: { finalFare: 0 } }));

      // 4. Calculate average rating from completed trips
      const ratingData = await this.prisma.trip.aggregate({
        _avg: { rating: true },
        where: { status: TripStatus.COMPLETED, rating: { not: null } }
      }).catch(() => ({ _avg: { rating: 0 } }));

      // 5. Return the real data
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
        revenueChart: [] // We will build this later
      };
    } catch (error) {
      console.error("Database error:", error);
      // Fallback to zeros so the frontend doesn't crash
      return {
        stats: { totalTrips: 0, activeRiders: 0, activeCustomers: 0, totalRevenue: 0, averageRating: 0 },
        tripStatus: { completed: 0, inProgress: 0, pending: 0, cancelled: 0 },
        revenueChart: []
      };
    }
  }

  @Get('api/seed')
  async seedDatabase() {
    try {
      // Check if we already seeded
      const userCount = await this.prisma.user.count();
      if (userCount > 0) return { message: "Database already seeded!" };

      // Create Customer
      const customer = await this.prisma.user.create({
        data: { phone: '+254700111222', role: Role.CUSTOMER, email: 'customer@test.com' },
      });

      // Create Rider
      const rider = await this.prisma.user.create({
        data: { phone: '+254700333444', role: Role.RIDER, isOnline: true, email: 'rider@test.com' },
      });

      // Create 3 Completed Trips
      for (let i = 0; i < 3; i++) {
        await this.prisma.trip.create({
          data: {
            customerId: customer.id, riderId: rider.id,
            pickupLat: -1.29, pickupLng: 36.82, dropoffLat: -1.30, dropoffLng: 36.83,
            estimatedFare: 500, finalFare: 450, status: TripStatus.COMPLETED, rating: 5
          },
        });
      }

      // Create 1 In-Progress Trip
      await this.prisma.trip.create({
        data: {
          customerId: customer.id, riderId: rider.id,
          pickupLat: -1.29, pickupLng: 36.82, dropoffLat: -1.30, dropoffLng: 36.83,
          estimatedFare: 300, status: TripStatus.IN_PROGRESS
        },
      });

      // Create 1 Pending Trip
      await this.prisma.trip.create({
        data: {
          customerId: customer.id,
          pickupLat: -1.29, pickupLng: 36.82, dropoffLat: -1.30, dropoffLng: 36.83,
          estimatedFare: 200, status: TripStatus.REQUESTED
        },
      });

      return { success: true, message: "Database seeded successfully!" };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }}


