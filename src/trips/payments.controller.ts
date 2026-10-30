import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPayments() {
    return this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Get('seed')
  async seedPayments() {
    const existing = await this.prisma.payment.count();
    if (existing > 0) return { message: "Payments already exist." };

    await this.prisma.payment.createMany({
      data: [
        { transactionRef: "TXN-1001", amount: 450, method: "MPESA", status: "SUCCESSFUL", providerRef: "MPESA-ABC123" },
        { transactionRef: "TXN-1002", amount: 300, method: "CASH", status: "SUCCESSFUL" },
        { transactionRef: "TXN-1003", amount: 1500, method: "MPESA", status: "FAILED", providerRef: "MPESA-XYZ987" },
        { transactionRef: "TXN-1004", amount: 200, method: "MPESA", status: "PENDING" }
      ]
    });
    return { message: "✅ 4 Dummy payments created!" };
  }
}
