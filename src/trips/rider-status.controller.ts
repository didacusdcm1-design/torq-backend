import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderStatusController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('status')
  async updateStatus(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: body.isOnline,
        currentLat: body.isOnline ? -1.2650 : null, 
        currentLng: body.isOnline ? 36.8030 : null,
      },
    });
  }
}
