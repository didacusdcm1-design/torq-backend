import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 logs for performance
    });
  }

  @Get('seed')
  async seedLogs() {
    const existing = await this.prisma.auditLog.count();
    if (existing > 0) return { message: "Logs already exist." };

    await this.prisma.auditLog.createMany({
      data: [
        { actorId: "admin-01", action: "APPROVED_RIDER", entity: "Rider", entityId: "rider-123", details: "Approved rider John Doe after document verification." },
        { actorId: "admin-01", action: "UPDATED_PRICING", entity: "PricingRule", entityId: "price-01", details: "Changed base fare from 50 to 60 KES." },
        { actorId: "admin-02", action: "CANCELLED_TRIP", entity: "Trip", entityId: "trip-456", details: "Cancelled trip due to customer request." },
        { actorId: "admin-01", action: "PAYOUT_APPROVED", entity: "Wallet", entityId: "wallet-789", details: "Approved payout of 5000 KES to rider." }
      ]
    });
    return { message: "✅ 4 Dummy audit logs created!" };
  }
}
