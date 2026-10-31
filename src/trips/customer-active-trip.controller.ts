import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer')
export class CustomerController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('active-trip')
  async getActiveTrip(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.prisma.trip.findFirst({
      where: {
        customerId: userId,
        status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS_DEST'] }
      },
      include: { rider: { include: { riderProfile: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.prisma.trip.findMany({
      where: { 
        customerId: userId,
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      include: { rider: { include: { riderProfile: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('notifications')
  async getNotifications(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    // Fetch notifications for this user
    const notifications = await this.prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // If no notifications exist, return a welcome message to prevent empty state
    if (notifications.length === 0) {
      return [{
        id: 'welcome-1',
        message: 'Welcome to TORQ! Your journey starts here.',
        type: 'PROMO',
        createdAt: new Date().toISOString()
      }];
    }
    return notifications;
  }
}