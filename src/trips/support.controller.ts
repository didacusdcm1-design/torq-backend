import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('support')
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getTickets() {
    return this.prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.supportTicket.update({ where: { id }, data: { status } });
  }

  @Get('seed')
  async seedTickets() {
    const existing = await this.prisma.supportTicket.count();
    if (existing > 0) return { message: "Tickets already exist." };

    await this.prisma.supportTicket.createMany({
      data: [
        { ticketRef: "TK-1001", subject: "Lost Phone in Ride", description: "I left my phone in the back seat.", status: "OPEN", priority: "HIGH" },
        { ticketRef: "TK-1002", subject: "Overcharged for Trip", description: "The fare was higher than the estimate.", status: "OPEN", priority: "MEDIUM" },
        { ticketRef: "TK-1003", subject: "Rider was rude", description: "The rider used inappropriate language.", status: "IN_PROGRESS", priority: "URGENT" }
      ]
    });
    return { message: "✅ 3 Dummy tickets created!" };
  }
}
