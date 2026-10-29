import { Injectable } from '@nestjs/common';

@Injectable()
export class FareCalculatorService {
  // TORQ Business Rules (These should eventually be fetched from a Pricing table in the DB)
  private readonly BASE_FARE = 50; // KES
  private readonly PER_KM_RATE = 30; // KES
  private readonly PER_MINUTE_RATE = 5; // KES
  private readonly COMMISSION_RATE = 0.15; // 15%

  calculateFare(distanceKm: number, durationMins: number) {
    const distanceCost = distanceKm * this.PER_KM_RATE;
    const timeCost = durationMins * this.PER_MINUTE_RATE;
    
    // 1. Calculate Gross Fare
    const grossFare = this.BASE_FARE + distanceCost + timeCost;
    
    // 2. Calculate TORQ Commission
    const commission = grossFare * this.COMMISSION_RATE;
    
    // 3. Calculate Rider Earnings
    const riderEarnings = grossFare - commission;

    // Round to 2 decimal places for currency
    return {
      grossFare: Math.round(grossFare * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      riderEarnings: Math.round(riderEarnings * 100) / 100,
    };
  }

  generatePickupPin(): string {
    // Generates a random 4-digit PIN (e.g., "4921")
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
