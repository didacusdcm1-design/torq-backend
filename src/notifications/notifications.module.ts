import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { ChatGateway } from './chat.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, ChatGateway]
})
export class NotificationsModule {}
