import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, title: string, message: string) {
    return this.prisma.notification.create({ data: { userId, title, message } });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async sendMessage(tripId: string, senderId: string, receiverId: string, content: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    return this.prisma.message.create({ data: { tripId, senderId, receiverId, content } });
  }

  async getTripMessages(tripId: string) {
    return this.prisma.message.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
