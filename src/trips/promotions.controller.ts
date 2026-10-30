import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPromos() {
    return this.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post()
  async createPromo(@Body() body: any) {
    return this.prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      }
    });
  }

  @Patch(':id/toggle')
  async togglePromo(@Param('id') id: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new Error('Promo not found');
    
    return this.prisma.promoCode.update({
      where: { id },
      data: { isActive: !promo.isActive }
    });
  }
}
