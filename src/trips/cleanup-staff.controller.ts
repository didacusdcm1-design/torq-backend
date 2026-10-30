import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cleanup-staff')
export class CleanupStaffController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async cleanup() {
    try {
      // Delete all existing staff so the new password column can be added
      const result = await this.prisma.staff.deleteMany({});
      return { 
        message: "✅ Staff table cleared!", 
        deletedCount: result.count 
      };
    } catch (error: any) {
      return { message: "❌ Failed", error: error.message };
    }
  }
}
