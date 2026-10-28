import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { ConfigModule } from '@nestjs/config';
import { EventsGateway } from './events/events.gateway';
import { AdminController } from './admin/admin.controller';
import { PricingModule } from './pricing/pricing.module';
import { RidersModule } from './riders/riders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TripsModule,
    PricingModule,
    RidersModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}