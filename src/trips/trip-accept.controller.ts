import { Controller, Patch, Param, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string) {
    try {
      // 1. Find a rider to assign
      const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      if (!rider) throw new Error('No rider found');

      // 2. Use RAW SQL to force the update
      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'ACCEPTED'::"TripStatus", "riderId" = ${rider.id}
        WHERE "id" = ${id}
      `;

      return { success: true, message: 'Trip accepted successfully' };
    } catch (error: any) {
      console.error("Accept Trip Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }
}