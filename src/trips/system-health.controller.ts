import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('system')
export class SystemHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async getHealth() {
    let dbStatus = 'DOWN';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'UP';
    } catch (e) {}

    return {
      api: 'UP',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
