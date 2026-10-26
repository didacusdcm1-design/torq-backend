import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Called whenever a trip is requested
  emitNewTrip(trip: any) {
    this.server.emit('newTrip', trip);
  }

  // Called whenever a trip is accepted or its status changes
  emitTripUpdate(trip: any) {
    this.server.emit('tripUpdate', trip);
  }
}
