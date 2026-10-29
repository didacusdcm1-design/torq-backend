import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  // 1. For the Admin Table
  async findAll(search?: string) {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, rider: true },
    });
  }

  // 2. Restore missing methods for your Controller
  async createTrip(body: any, customerId: string) {
    return this.prisma.trip.create({
      data: {
        ...body,
        customerId,
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
      where: { status: 'REQUESTED', riderId: null },
    });
  }

  async acceptTrip(id: string, riderId: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { riderId, status: 'ASSIGNED' },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.trip.update({
      where: { id },
      data: { status },
    });
  }

  async getAllTripsForAdmin(search?: string) {
    return this.prisma.trip.findMany({
      where: search ? {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { createdAt: 'desc' },
      include: { customer: true, rider: true },
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(id: string, role: any) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateFullProfile(userId: string, body: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: body,
    });
  }

  // Method to fetch a single trip for our Details page
  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { customer: true, rider: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }
}
