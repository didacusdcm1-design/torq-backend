import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FareCalculatorService } from './fare-calculator.service'; // <-- Import

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private fareCalculator: FareCalculatorService // <-- Inject
  ) {}

  // ... (Keep all your other existing methods like findAll, findOne, etc. here) ...
  
  async findAll(search?: string) {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, rider: true },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { customer: true, rider: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  // --- UPDATED CREATE TRIP LOGIC ---
  async createTrip(body: any, customerId: string) {
    // 1. Get distance and duration from the request body
    const distanceKm = body.distanceKm || 5; // Default to 5km if not provided (for testing)
    const durationMins = body.durationMins || 15; // Default to 15 mins

    // 2. Calculate the fare on the backend (Do NOT trust frontend fares)
    const financials = this.fareCalculator.calculateFare(distanceKm, durationMins);
    
    // 3. Generate the Pickup PIN
    const pickupPin = this.fareCalculator.generatePickupPin();

    // 4. Save to database
    return this.prisma.trip.create({
      data: {
        pickupLat: body.pickupLat,
        pickupLng: body.pickupLng,
        dropoffLat: body.dropoffLat,
        dropoffLng: body.dropoffLng,
        estimatedFare: financials.grossFare,
        finalFare: financials.grossFare, // For now, final = estimated
        distanceKm: distanceKm,
        durationMins: durationMins,
        pickupPin: pickupPin,
        customerId: customerId,
        status: 'REQUESTED',
      },
    });
  }

  // ... (Keep all the other methods like getUserTrips, getPendingTrips, etc.) ...
}
