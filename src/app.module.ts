import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RidersModule } from './riders/riders.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    RidersModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

