import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitNewTrip(trip: any) {
    this.server.emit('newTrip', trip);
  }

  emitTripUpdate(trip: any) {
    // We emit the full updated trip object so apps don't need to re-fetch
    this.server.emit('tripUpdate', trip);
  }
}
