import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user_${userId}`);
    console.log(`Client joined personal room: user_${userId}`);
    return { event: 'joinedUserRoom', data: userId };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() tripId: string, @ConnectedSocket() client: Socket) {
    client.join(tripId);
    console.log(`Client joined trip room: ${tripId}`);
    return { event: 'joinedTripRoom', data: tripId };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { tripId: string; message: any }) {
    this.server.to(data.tripId).emit('newMessage', data.message);
  }
}