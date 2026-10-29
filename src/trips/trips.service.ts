import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  // --- TRIP MANAGEMENT ---
  async findAll(search?: string) {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, rider: true },
    });
  }

  async createTrip(body: any, customerId: string) {
    return this.prisma.trip.create({
      data: { ...body, customerId },
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
      data: { riderId, status: 'IN_PROGRESS' }, // Using IN_PROGRESS instead of ASSIGNED
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.trip.update({
      where: { id },
      data: { status: status as any },
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

  // --- ADMIN USER MANAGEMENT ---
  async getAllTripsForAdmin(search?: string) {
    return this.prisma.trip.findMany({
      where: search ? { id: { contains: search, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' },
      include: { customer: true, rider: true },
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
    });
  }

  async updateFullProfile(userId: string, body: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: body,
    });
  }

  // --- RIDER MANAGEMENT ---
  async approveRider(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: 'RIDER' }, // Assuming approval upgrades their role or status
    });
  }

  async rejectRider(id: string, reason: string) {
    // In a real app, save the reason in an audit log
    return this.prisma.user.update({
      where: { id },
      data: { role: 'CUSTOMER' }, // Demote back to customer
    });
  }

  async getRiderHistory(riderId: string) {
    return this.prisma.trip.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- WALLET & PAYOUTS ---
  async getWallet(userId: string) {
    // Mocking wallet for now if you don't have a Wallet table fully set up
    return { balance: 0, currency: 'KES' };
  }

  async requestPayout(userId: string) {
    return { message: 'Payout request received', status: 'PENDING' };
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
