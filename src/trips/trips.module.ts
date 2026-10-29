import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsGateway } from '../events/events.gateway';
import { FareCalculatorService } from './fare-calculator.service';
import { DispatchService } from './dispatch.service';
import { OnlineSeedController } from './online.seed';
import { LedgerController } from './ledger.controller';
import { WalletController } from './wallet.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController, OnlineSeedController, LedgerController, WalletController],
  providers: [TripsService, EventsGateway, FareCalculatorService, DispatchService],
})
export class TripsModule {}


