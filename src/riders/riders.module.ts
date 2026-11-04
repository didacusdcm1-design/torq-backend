import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RiderEarningsController } from './rider-earnings.controller';
import { RidersController } from './riders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RidersController, RiderEarningsController],
  providers: [RidersService],
})
export class RidersModule {}
