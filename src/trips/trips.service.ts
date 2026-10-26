import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

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

    return await this.prisma.trip.create({
      data: {
        pickupLat, pickupLng, dropoffLat, dropoffLng,
        estimatedFare: parseFloat(estimatedFare.toFixed(2)),
        status: 'REQUESTED' as any, 
        customer: { connect: { id: userId } }
      },
    });
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
          { 
            riderId: riderId, 
            status: { in: ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] as any[] } 
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptTrip(tripId: string, riderId: string) {
    return this.prisma.trip.update({
      where: { id: tripId },
      data: { status: 'ACCEPTED' as any, riderId: riderId },
    });
  }

  async updateStatus(tripId: string, status: string) {
    return this.prisma.trip.update({
      where: { id: tripId },
      data: { status: status as any },
    });
  }

  // ADDED FOR ADMIN DASHBOARD
  async getAllTripsForAdmin() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // Get the 10 most recent trips
      include: {
        customer: { select: { email: true } },
        rider: { select: { email: true } }
      }
    });
  }
}
