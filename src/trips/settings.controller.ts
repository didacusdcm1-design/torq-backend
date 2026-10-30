import { Controller, Get, Patch, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getSettings() {
    let settings = await this.prisma.systemSetting.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await this.prisma.systemSetting.create({ data: { id: 'global' } });
    }
    return settings;
  }

  @Patch()
  async updateSettings(@Body() body: any) {
    return this.prisma.systemSetting.update({
      where: { id: 'global' },
      data: {
        companyName: body.companyName,
        supportEmail: body.supportEmail,
        supportPhone: body.supportPhone,
        currency: body.currency,
        timezone: body.timezone,
      },
    });
  }
}
