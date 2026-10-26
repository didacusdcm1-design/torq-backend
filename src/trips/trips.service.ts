import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  async createTrip(data: any, userId: string) {
    const pickupLat = Number(data.pickupLat);
    const pickupLng = Number(data.pickupLng);
    const dropoffLat = Number(data.dropoffLat);
    const dropoffLng = Number(data.dropoffLng);
    const distance = this.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const estimatedFare = 50 + (distance * 20);

    const trip = await this.prisma.trip.create({
      data: {
        pickupLat, pickupLng, dropoffLat, dropoffLng,
        estimatedFare: parseFloat(estimatedFare.toFixed(2)),
        status: 'REQUESTED' as any, 
        customer: { connect: { id: userId } }
      },
      include: { customer: { select: { email: true } } }
    });

    this.eventsGateway.emitNewTrip(trip);
    return trip;
  }

  async getUserTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
    });
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
    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { 
        status: 'ACCEPTED' as any, 
        rider: { connect: { id: riderId } } 
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

  async getAllTripsForAdmin() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: { select: { email: true } },
        rider: { select: { email: true } }
      }
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }
}
