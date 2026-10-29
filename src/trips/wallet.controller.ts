import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallets')
export class WalletController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('riders')
  async getRiderWallets() {
    // 1. Get all riders
    const riders = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      select: {
        id: true,
        phone: true,
        email: true,
        riderTrips: {
          select: {
            id: true,
            ledgerEntries: {
              where: { entryType: 'RIDER_EARNING' },
              select: { amount: true }
            }
          }
        }
      }
    });

    // 2. Calculate total earnings for each rider
    return riders.map(rider => {
      let totalEarnings = 0;
      rider.riderTrips.forEach(trip => {
        trip.ledgerEntries.forEach(entry => {
          totalEarnings += entry.amount;
        });
      });

      return {
        id: rider.id,
        phone: rider.phone,
        email: rider.email,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        availableBalance: Math.round(totalEarnings * 100) / 100, // Assuming no payouts yet
        totalTrips: rider.riderTrips.length
      };
    });
  }
}
