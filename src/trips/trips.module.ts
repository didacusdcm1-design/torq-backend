import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripSeedController } from './trips.seed';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController, TripSeedController],
  providers: [TripsService],
})
export class TripsModule {}
