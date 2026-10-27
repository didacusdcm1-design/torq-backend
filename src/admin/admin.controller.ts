import { Controller, Get, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('wallets')
  async getWallets() {
    return this.prisma.wallet.findMany({
      include: { user: { select: { email: true, role: true } } }
    });
  }

  @Patch('wallets/:id/payout')
  async processPayout(@Param('id') id: string, @Body('amount') amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }
    return this.prisma.wallet.update({
      where: { id },
      data: { balance: wallet.balance - amount, pendingEarnings: wallet.pendingEarnings + amount },
    });
  }
}
