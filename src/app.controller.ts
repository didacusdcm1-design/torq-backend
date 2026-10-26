import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { execSync } from 'child_process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sync-db')
  async syncDb() {
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      return { message: 'Database synced successfully!' };
    } catch (e: any) {
      return { error: e.message || e };
    }
  }
}
