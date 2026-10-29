import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FareCalculatorService } from './fare-calculator.service';

@Injectable()
export class DispatchService {
  constructor(
    private prisma: PrismaService,
    private fareCalculator: FareCalculatorService
  ) {}

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async dispatchRide(customerId: string, pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number, distanceKm: number, durationMins: number) {
    const onlineRiders = await this.prisma.user.findMany({
      where: { role: 'RIDER', isOnline: true, currentLat: { not: null }, currentLng: { not: null } },
    });

    if (onlineRiders.length === 0) {
      throw new NotFoundException('No riders are currently online.');
    }

    const ridersWithDistance = onlineRiders.map((rider) => {
      const distanceToPickup = this.calculateDistance(pickupLat, pickupLng, rider.currentLat!, rider.currentLng!);
      return { rider, distanceToPickup };
    }).sort((a, b) => a.distanceToPickup - b.distanceToPickup);

    const financials = this.fareCalculator.calculateFare(distanceKm, durationMins);
    const pickupPin = this.fareCalculator.generatePickupPin();
    const closestRider = ridersWithDistance[0].rider;

    // Use a transaction to ensure the trip and ledger are created together
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Trip
      const trip = await tx.trip.create({
        data: {
          pickupLat, pickupLng, dropoffLat, dropoffLng, distanceKm, durationMins,
          estimatedFare: financials.grossFare,
          finalFare: financials.grossFare,
          pickupPin,
          customerId,
          riderId: closestRider.id,
          status: 'ACCEPTED', 
        },
      });

      // 2. Create the Ledger Entries
      await tx.ledgerEntry.createMany({
        data: [
          { tripId: trip.id, entryType: 'GROSS_FARE', amount: financials.grossFare },
          { tripId: trip.id, entryType: 'COMMISSION', amount: financials.commission },
          { tripId: trip.id, entryType: 'RIDER_EARNING', amount: financials.riderEarnings },
        ]
      });

      return {
        message: 'Trip dispatched and ledger updated successfully',
        trip,
        assignedRider: { id: closestRider.id, distanceToPickupKm: Math.round(ridersWithDistance[0].distanceToPickup * 100) / 100 },
        financials
      };
    });
  }
}
