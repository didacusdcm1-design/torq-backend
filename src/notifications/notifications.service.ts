import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, title: string, message: string) {
    return this.prisma.notification.create({ data: { userId, title, message } });
  }

  async getAllNotifications() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getUserNotifications(userId: string) {
    // Cast to Prisma.NotificationWhereInput to bypass strict null checking
    // while still allowing the query to search for nulls at runtime.
    const whereClause: Prisma.NotificationWhereInput = {
      OR: [
        { userId: userId },
        { userId: null }
      ]
    } as unknown as Prisma.NotificationWhereInput;

    return this.prisma.notification.findMany({
      where: whereClause,
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

  async broadcast(title: string, message: string, target: string) {
    let users;
    if (target === 'RIDERS') {
      users = await this.prisma.user.findMany({ where: { role: 'RIDER' } });
    } else if (target === 'CUSTOMERS') {
      users = await this.prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    } else {
      users = await this.prisma.user.findMany();
    }

    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
    }));

    return this.prisma.notification.createMany({ data: notifications });
  }
}