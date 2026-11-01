import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Body() body: { userId: string; title: string; message: string }) {
    return this.notificationsService.createNotification(body.userId, body.title, body.message);
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('chat')
  async sendMessage(@Body() body: { tripId: string; senderId: string; receiverId: string; content: string }) {
    return this.notificationsService.sendMessage(body.tripId, body.senderId, body.receiverId, body.content);
  }

  @Get('chat/:tripId')
  async getTripMessages(@Param('tripId') tripId: string) {
    return this.notificationsService.getTripMessages(tripId);
  }

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; message: string; target: string }) {
    return this.notificationsService.broadcast(body.title, body.message, body.target);
  }
}
