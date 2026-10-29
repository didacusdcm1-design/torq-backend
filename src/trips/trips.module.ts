import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsGateway } from '../events/events.gateway';
import { FareCalculatorService } from './fare-calculator.service';
import { DispatchService } from './dispatch.service';
import { LedgerController } from './ledger.controller';
import { WalletController } from './wallet.controller';
import { NotificationsController } from './notifications.controller';
import { RiderRegistrationController } from './rider-registration.controller';
import { RiderStatusController } from './rider-status.controller';
import { ForceOnlineController } from './force-online.controller';
import { TripAcceptController } from './trip-accept.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TripsController,
    LedgerController,
    WalletController,
    NotificationsController,
    RiderRegistrationController,
    RiderStatusController,
    ForceOnlineController,
    TripAcceptController
  ],
  providers: [
    TripsService,
    EventsGateway,
    FareCalculatorService,
    DispatchService
  ],
})
export class TripsModule {}
