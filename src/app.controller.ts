import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // --- Paste the new route here ---
  @Get('api/admin/dashboard')
  getDashboardStats() {
    return {
      stats: {
        totalTrips: 0,
        activeRiders: 3,
        activeCustomers: 1,
        totalRevenue: 0,
        averageRating: 4.7
      },
      tripStatus: {
        completed: 606,
        inProgress: 135,
        pending: 59,
        cancelled: 42
      },
      revenueChart: [
        { date: "Apr 19", amount: 350 },
        { date: "Apr 20", amount: 400 },
        { date: "Apr 21", amount: 480 }
      ]
    };
  }
}