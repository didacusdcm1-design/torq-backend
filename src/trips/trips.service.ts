import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async createTrip(data: any, userId: string) {
    const trip = await this.prisma.trip.create({
      data: {
        pickupLat: Number(data.pickupLat),
        pickupLng: Number(data.pickupLng),
        dropoffLat: Number(data.dropoffLat),
        dropoffLng: Number(data.dropoffLng),
        estimatedFare: 150,
        status: 'REQUESTED' as any, 
        customer: { connect: { id: userId } }
      },
      include: { customer: { select: { email: true } } }
    });
    this.eventsGateway.emitNewTrip(trip);
    return trip;
  }

  async getPendingTrips(riderId: string) {
    return this.prisma.trip.findMany({
      where: {
        OR: [
          { status: 'REQUESTED' as any },
          { riderId: riderId, status: { in: ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] as any[] } }
        ]
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptTrip(tripId: string, riderId: string) {
    // THIS IS THE CRITICAL FIX: Linking the rider to the trip
    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { 
        status: 'ACCEPTED' as any, 
        rider: { connect: { id: riderId } } // <-- Connects the Rider
      },
    });
    this.eventsGateway.emitTripUpdate(trip);
    return trip;
  }

  async updateStatus(tripId: string, status: string) {
    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: status as any },
    });
    this.eventsGateway.emitTripUpdate(trip);
    return trip;
  }

  async getUserTrips(userId: string) {
    return this.prisma.trip.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' } });
  }

  async getAllTripsForAdmin() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { customer: { select: { email: true } }, rider: { select: { email: true } } }
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  }
}
