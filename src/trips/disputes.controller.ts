import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDisputes() {
    return this.prisma.dispute.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.dispute.update({ where: { id }, data: { status } });
  }

  @Get('seed')
  async seedDisputes() {
    const existing = await this.prisma.dispute.count();
    if (existing > 0) return { message: "Disputes already exist." };

    await this.prisma.dispute.createMany({
      data: [
        { disputeRef: "DSP-1001", subject: "Overcharge on Trip", description: "Customer claims they were charged 500 KES instead of 450 KES.", amount: 50, status: "OPEN", priority: "HIGH" },
        { disputeRef: "DSP-1002", subject: "Rider not paid", description: "Rider claims the payout was short by 100 KES.", amount: 100, status: "UNDER_REVIEW", priority: "MEDIUM" },
        { disputeRef: "DSP-1003", subject: "Cancellation Fee", description: "Customer wants a refund for a cancelled trip.", amount: 100, status: "RESOLVED", priority: "LOW" }
      ]
    });
    return { message: "✅ 3 Dummy disputes created!" };
  }
}
