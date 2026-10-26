import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { EventsGateway } from '../events/events.gateway';

@Module({
  controllers: [TripsController],
  providers: [TripsService, EventsGateway],
})
export class TripsModule {}
