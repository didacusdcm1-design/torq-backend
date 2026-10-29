import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { phone: true, role: true }
        }
      }
    });
  }

  // SECURED: Only logged-in admins can send notifications
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async sendNotification(@Body() body: any) {
    // If body.userId is provided, send to that user. Otherwise, broadcast to ALL riders.
    if (body.userId) {
      return this.prisma.notification.create({
        data: {
          userId: body.userId,
          message: body.message,
        },
      });
    } else {
      // Broadcast to all riders
      const riders = await this.prisma.user.findMany({ where: { role: 'RIDER' } });
      
      const notifications = riders.map(rider => ({
        userId: rider.id,
        message: body.message,
      }));

      await this.prisma.notification.createMany({ data: notifications });
      
      return { message: `Broadcast sent to ${riders.length} riders.` };
    }
  }
}


