import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Allow Flutter web to connect
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // When a client joins a specific trip's chat room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() tripId: string, @ConnectedSocket() client: Socket) {
    client.join(tripId);
    console.log(`Client joined room: ${tripId}`);
  }

  // When a client sends a message, relay it to everyone in the room
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { tripId: string; message: any }) {
    this.server.to(data.tripId).emit('newMessage', data.message);
  }
}