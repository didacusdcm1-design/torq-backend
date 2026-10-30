import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cleanup-trips')
export class CleanupTripsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async cleanup() {
    try {
      // Force cancel ALL active trips
      const result = await this.prisma.$executeRaw`
        UPDATE "Trip" 
        SET "status" = 'CANCELLED'::"TripStatus", "cancellationReason" = 'System cleanup during testing'
        WHERE "status" NOT IN ('COMPLETED', 'CANCELLED')
      `;

      return { 
        message: "✅ Database cleaned! All stuck trips cancelled.", 
        rowsAffected: result 
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
