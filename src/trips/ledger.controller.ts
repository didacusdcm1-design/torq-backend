import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async getSummary() {
    // Aggregate the ledger entries by type
    const aggregations = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      _sum: {
        amount: true,
      },
    });

    // Format the response for the frontend
    let grossVolume = 0;
    let totalCommission = 0;
    let totalRiderEarnings = 0;

    aggregations.forEach((agg) => {
      if (agg.entryType === 'GROSS_FARE') grossVolume = agg._sum.amount || 0;
      if (agg.entryType === 'COMMISSION') totalCommission = agg._sum.amount || 0;
      if (agg.entryType === 'RIDER_EARNING') totalRiderEarnings = agg._sum.amount || 0;
    });

    const totalTransactions = await this.prisma.ledgerEntry.count();

    return {
      grossVolume,
      totalCommission,
      totalRiderEarnings,
      totalTransactions,
    };
  }
}
