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
import { TripCompletionController } from './trip-completion.controller';
import { TripCancellationController } from './trip-cancellation.controller';
import { CleanupTripsController } from './cleanup-trips.controller';
import { FleetController } from './fleet.controller';
import { ServiceAreaController } from './service-area.controller';
import { PromotionsController } from './promotions.controller';
import { RatingsController } from './ratings.controller';
import { SupportController } from './support.controller';
import { SafetyController } from './safety.controller';
import { DisputesController } from './disputes.controller';
import { AuditLogsController } from './audit-logs.controller';

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
    TripAcceptController,
    TripCompletionController,
    TripCancellationController,
    CleanupTripsController,
    FleetController,
    ServiceAreaController,
    PromotionsController,
    RatingsController,
    SupportController,
    SafetyController,
    DisputesController
  ],
  providers: [
    TripsService,
    EventsGateway,
    FareCalculatorService,
    DispatchService
  ],
})
export class TripsModule {}

