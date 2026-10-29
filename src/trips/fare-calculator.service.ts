import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FareCalculatorService {
  constructor(private prisma: PrismaService) {}

  // Helper to get rules (fallback to defaults if DB is empty)
  private async getRules() {
    let rules = await this.prisma.pricingRule.findFirst();
    if (!rules) {
      rules = await this.prisma.pricingRule.create({
        data: { baseFare: 50, perKmRate: 30, perMinuteRate: 5, commissionRate: 0.15 }
      });
    }
    return rules;
  }

  async calculateFare(distanceKm: number, durationMins: number) {
    const rules = await this.getRules();
    
    const distanceCost = distanceKm * rules.perKmRate;
    const timeCost = durationMins * rules.perMinuteRate;
    const grossFare = rules.baseFare + distanceCost + timeCost;
    
    const commission = grossFare * rules.commissionRate;
    const riderEarnings = grossFare - commission;

    return {
      grossFare: Math.round(grossFare * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      riderEarnings: Math.round(riderEarnings * 100) / 100,
    };
  }

  generatePickupPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
