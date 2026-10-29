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
import { CustomerSeedController } from './customer.seed';


@Module({
  imports: [PrismaModule],
  controllers: [TripsController, LedgerController, WalletController, NotificationsController, CustomerSeedController],
  providers: [TripsService, EventsGateway, FareCalculatorService, DispatchService],
})
export class TripsModule {}







