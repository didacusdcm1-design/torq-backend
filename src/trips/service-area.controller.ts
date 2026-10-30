import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('service-areas')
export class ServiceAreaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAreas() {
    return this.prisma.serviceArea.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  async createArea(@Body() body: { name: string, city: string }) {
    return this.prisma.serviceArea.create({
      data: { name: body.name, city: body.city, isActive: true }
    });
  }

  @Patch(':id/toggle')
  async toggleArea(@Param('id') id: string) {
    const area = await this.prisma.serviceArea.findUnique({ where: { id } });
    if (!area) throw new Error('Area not found');
    return this.prisma.serviceArea.update({ where: { id }, data: { isActive: !area.isActive } });
  }
}
