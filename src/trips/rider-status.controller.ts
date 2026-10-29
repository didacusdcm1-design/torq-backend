import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderStatusController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('status')
  async updateStatus(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || 'f68aa177-f0e8-4b40-a74b-005a4a1d95a7'; // Fallback for testing

    // Update the user's online status and location
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: body.isOnline,
        // In a real app, you would get the actual GPS coordinates here
        currentLat: body.isOnline ? -1.2650 : null, 
        currentLng: body.isOnline ? 36.8030 : null,
      },
    });
  }
}

