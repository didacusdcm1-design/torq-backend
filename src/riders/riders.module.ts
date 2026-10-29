import { Module } from '@nestjs/common';
import { RidersService } from './riders.service';
import { RidersController } from './riders.controller';
import { SeedController } from './riders.seed';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RidersController, SeedController],
  providers: [RidersService],
})
export class RidersModule {}
