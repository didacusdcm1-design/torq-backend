import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsGateway } from '../events/events.gateway';
import { FareCalculatorService } from './fare-calculator.service'; // <-- Import

@Module({
  imports: [PrismaModule],
  controllers: [TripsController],
  providers: [TripsService, EventsGateway, FareCalculatorService], // <-- Add to providers
})
export class TripsModule {}
