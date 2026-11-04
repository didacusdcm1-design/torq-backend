import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ChatGateway } from './chat.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly chatGateway: ChatGateway
  ) {}

  @Post()
  async createNotification(@Body() body: { userId: string; title: string; message: string }) {
    return this.notificationsService.createNotification(body.userId, body.title, body.message);
  }

  @Get('my-notifications')
  async getUserNotifications(@Body() body?: any) {
    return this.notificationsService.getAllNotifications();
  }

  @Get('user/:userId')
  async getUserNotificationsById(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('chat')
  async sendMessage(@Body() body: { tripId: string; senderId: string; receiverId: string; content: string }) {
    const msg = await this.notificationsService.sendMessage(body.tripId, body.senderId, body.receiverId, body.content);
    // Optional: Emit the chat message in real-time
    this.chatGateway.server.to(body.tripId).emit('newMessage', msg);
    return msg;
  }

  @Get('chat/:tripId')
  async getTripMessages(@Param('tripId') tripId: string) {
    return this.notificationsService.getTripMessages(tripId);
  }

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; message: string; target: string }) {
    const result = await this.notificationsService.broadcast(body.title, body.message, body.target);
    
    // ?? THIS IS THE MAGIC LINE! Broadcasts to all connected apps instantly.
    this.chatGateway.server.emit('newNotification', result);
    
    return result;
  }
}