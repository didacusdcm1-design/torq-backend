import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripSeedController } from './trips.seed';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsGateway } from '../events/events.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController, TripSeedController],
  providers: [TripsService, EventsGateway], // <-- Added EventsGateway here
})
export class TripsModule {}
