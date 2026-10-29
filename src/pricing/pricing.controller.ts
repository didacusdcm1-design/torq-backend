import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('pricing')
export class PricingController {
  @Get()
  getPricing() {
    // Return hardcoded default pricing until we build a PricingRule model
    return {
      baseFare: 50,
      perKmRate: 30,
      perMinuteRate: 5,
      commissionRate: 0.15
    };
  }

  @Post()
  updatePricing(@Body() body: any) {
    return { message: 'Pricing updated', data: body };
  }
}
