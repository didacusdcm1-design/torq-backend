import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('pricing')
export class PricingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPricing() {
    let rules = await this.prisma.pricingRule.findFirst();
    if (!rules) {
      rules = await this.prisma.pricingRule.create({
        data: { baseFare: 50, perKmRate: 30, perMinuteRate: 5, commissionRate: 0.15 }
      });
    }
    return rules;
  }

  // SECURED: Only logged-in admins can update pricing
  @Patch()
  async updatePricing(@Body() body: any) {
    let rules = await this.prisma.pricingRule.findFirst();
    
    // If no rules exist yet, create them with the body data
    if (!rules) {
      return this.prisma.pricingRule.create({
        data: {
          baseFare: Number(body.baseFare) || 50,
          perKmRate: Number(body.perKmRate) || 30,
          perMinuteRate: Number(body.perMinuteRate) || 5,
          commissionRate: Number(body.commissionRate) || 0.15,
        },
      });
    }
    
    // Otherwise, update the existing rules
    return this.prisma.pricingRule.update({
      where: { id: rules.id },
      data: {
        baseFare: Number(body.baseFare),
        perKmRate: Number(body.perKmRate),
        perMinuteRate: Number(body.perMinuteRate),
        commissionRate: Number(body.commissionRate),
      },
    });
  }
}


