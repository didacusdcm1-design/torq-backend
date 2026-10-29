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
      include: { 
        customer: true, 
        rider: true,
        ledgerEntries: true // <-- THIS IS THE MISSING PIECE
      },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  // --- UPDATED CREATE TRIP LOGIC ---
    async createTrip(body: any, customerId?: string) {
    // 1. Get distance and duration
    const distanceKm = Number(body.distanceKm) || 5;
    const durationMins = Number(body.durationMins) || 15;

    // 2. Calculate the fare
    const financials = this.fareCalculator.calculateFare(distanceKm, durationMins);
    const pickupPin = this.fareCalculator.generatePickupPin();

    // 3. Find a valid customer ID (fallback if not logged in)
    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      const firstCustomer = await this.prisma.user.findFirst({
        where: { role: 'CUSTOMER' }
      });
      if (!firstCustomer) {
        throw new Error("No customers exist in the database. Please register one first.");
      }
      finalCustomerId = firstCustomer.id;
    }

    // 4. Save to database
    return this.prisma.trip.create({
      data: {
        pickupLat: Number(body.pickupLat),
        pickupLng: Number(body.pickupLng),
        dropoffLat: Number(body.dropoffLat),
        dropoffLng: Number(body.dropoffLng),
        estimatedFare: financials.grossFare,
        finalFare: financials.grossFare,
        distanceKm: distanceKm,
        durationMins: durationMins,
        pickupPin: pickupPin,
        customerId: finalCustomerId,
        status: 'REQUESTED',
      },
    });
  }

  // ... (Keep all the other methods like getUserTrips, getPendingTrips, etc.) ...
}


