import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async getSummary() {
    const aggregations = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      _sum: { amount: true },
    });

    let grossVolume = 0;
    let totalCommission = 0;
    let totalRiderEarnings = 0;

    aggregations.forEach((agg) => {
      if (agg.entryType === 'GROSS_FARE') grossVolume = agg._sum.amount || 0;
      if (agg.entryType === 'COMMISSION') totalCommission = agg._sum.amount || 0;
      if (agg.entryType === 'RIDER_EARNING') totalRiderEarnings = agg._sum.amount || 0;
    });

    const totalTransactions = await this.prisma.ledgerEntry.count();

    return { grossVolume, totalCommission, totalRiderEarnings, totalTransactions };
  }

  @Get('chart-data')
  async getChartData() {
    // For now, we will fetch all entries and group them in JS to avoid raw SQL date truncation complexities across different DB versions.
    const entries = await this.prisma.ledgerEntry.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const dailyData: Record<string, { date: string, revenue: number, commission: number }> = {};

    entries.forEach(entry => {
      // Format date as "Oct 29"
      const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, revenue: 0, commission: 0 };
      }

      if (entry.entryType === 'GROSS_FARE') {
        dailyData[dateStr].revenue += entry.amount;
      } else if (entry.entryType === 'COMMISSION') {
        dailyData[dateStr].commission += entry.amount;
      }
    });

    return Object.values(dailyData);
  }
}
