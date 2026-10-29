import { Controller, Patch, Param, Body, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('trips')
export class TripCompletionController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('status/:id')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      // RAW SQL: Bypasses Prisma ORM cache entirely
      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = ${status}::"TripStatus"
        WHERE "id" = ${id}
      `;
      return { message: 'Status updated successfully' };
    } catch (error: any) {
      console.error("Status Update Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }

    @Patch('complete/:id')
  async completeTrip(@Param('id') id: string, @Body('pin') pin: string) {
    try {
      const trip = await this.prisma.trip.findUnique({ where: { id } });
      if (!trip) throw new Error('Trip not found');
      
      if (trip.pickupPin !== pin) throw new Error('Invalid PIN');

      // RAW SQL to force the update
      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'COMPLETED'::"TripStatus"
        WHERE "id" = ${id}
      `;
      return { success: true, message: 'Trip completed successfully' };
    } catch (error: any) {
      console.error("Complete Trip Error:", error);
      return { success: false, message: error.message };
    }
  }
}

