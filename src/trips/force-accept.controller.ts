import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('force-accept')
export class ForceAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async forceAccept(@Param('id') id: string) {
    try {
      const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      if (!rider) throw new Error('No rider found');

      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'ACCEPTED'::"TripStatus", "riderId" = ${rider.id}
        WHERE "id" = ${id}
      `;

      return { success: true, message: "✅ Trip forcefully accepted!", tripId: id };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}
