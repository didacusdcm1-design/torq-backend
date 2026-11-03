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
    // 1. Get direct messages for this user
    const userNotifications = await this.prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Get global broadcasts (where userId is null or empty)
    // We query for NOT userId, which Prisma allows, to get the global broadcasts safely.
    const globalBroadcasts = await this.prisma.notification.findMany({
      where: {
        NOT: { userId: userId }
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Combine and sort them
    const allNotifications = [...userNotifications, ...globalBroadcasts];
    allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return allNotifications;
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
    // Create ONE global notification that everyone can see.
    // We use userId: null for global broadcasts.
    return this.prisma.notification.create({
      data: {
        title,
        message,
        userId: null as any, // Global!
      },
    });
  }
}