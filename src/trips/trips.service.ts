import { Injectable, ForbiddenException } from '@nestjs/common';
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
    
    let pricing = await this.prisma.pricingRule.findFirst();
    if (!pricing) {
      pricing = await this.prisma.pricingRule.create({ data: {} });
    }

    const estimatedFare = pricing.baseFare + (distance * pricing.perKmRate);

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
      include: { rider: { select: { email: true } } }
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
      include: { customer: { select: { email: true } } }
    });
  }

  async acceptTrip(tripId: string, riderId: string) {
    // STRICT CHECK: Block if profile doesn't exist or isn't approved
    const riderProfile = await this.prisma.riderProfile.findUnique({ where: { userId: riderId } });
    
    if (!riderProfile) {
      throw new ForbiddenException('You must fill out your Account profile first.');
    }
    if (riderProfile.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Your account is pending Admin approval. You cannot accept rides yet.');
    }

    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { 
        status: 'ACCEPTED' as any, 
        rider: { connect: { id: riderId } } 
      },
      include: { customer: { select: { email: true } }, rider: { select: { email: true } } }
    });
    this.eventsGateway.emitTripUpdate(trip);
    return trip;
  }

  async updateStatus(tripId: string, status: string) {
    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: status as any },
      include: { customer: { select: { email: true } }, rider: { select: { email: true } } }
    });
    this.eventsGateway.emitTripUpdate(trip);
    return trip;
  }

  async getAllTripsForAdmin(search?: string) {
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { customer: { email: { contains: search } } },
        { rider: { email: { contains: search } } },
      ];
    }
    return this.prisma.trip.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { customer: { select: { email: true } }, rider: { select: { email: true } } }
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true }
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  }

  async updateFullProfile(userId: string, data: any) {
    return this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        nationalIdNumber: data.nationalIdNumber,
        emergencyContact: data.emergencyContact,
        motorcycleReg: data.motorcycleReg,
        motorcycleMake: data.motorcycleMake,
        motorcycleModel: data.motorcycleModel,
        insuranceExpiry: data.insuranceExpiry,
        idDocumentUrl: data.idDocumentUrl,
        licenseDocumentUrl: data.licenseDocumentUrl,
        insuranceDocumentUrl: data.insuranceDocumentUrl,
        selfieUrl: data.selfieUrl,
        verificationStatus: 'PENDING',
      },
      create: {
        userId: userId,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        nationalIdNumber: data.nationalIdNumber,
        emergencyContact: data.emergencyContact,
        motorcycleReg: data.motorcycleReg,
        motorcycleMake: data.motorcycleMake,
        motorcycleModel: data.motorcycleModel,
        insuranceExpiry: data.insuranceExpiry,
        idDocumentUrl: data.idDocumentUrl,
        licenseDocumentUrl: data.licenseDocumentUrl,
        insuranceDocumentUrl: data.insuranceDocumentUrl,
        selfieUrl: data.selfieUrl,
        verificationStatus: 'PENDING',
      },
    });
  }

  // NEW: Admin Approval Endpoint
  async approveRider(userId: string) {
    return this.prisma.riderProfile.update({
      where: { userId: userId },
      data: { verificationStatus: 'APPROVED' },
    });
  }
}
