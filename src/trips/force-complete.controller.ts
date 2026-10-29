import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('force-complete')
export class ForceCompleteController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async forceComplete(@Param('id') id: string) {
    try {
      // Force update using Raw SQL
      await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'COMPLETED'::"TripStatus"
        WHERE "id" = ${id}
      `;
      return { message: "✅ Trip forcefully marked as COMPLETED!", tripId: id };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
