import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    const users = await this.prisma.user.findMany({
      where: { riderProfile: { isNot: null } },
      include: { riderProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data: users };
  }

  async updateStatus(id: string, status: string) {
    let rejectionReason = status === 'REJECTED' ? 'Rejected by Admin' : null;
    return this.prisma.riderProfile.update({
      where: { userId: id },
      data: { rejectionReason },
    });
  }

  // ADD THIS: Logic to save the onboarding data
  async onboardRider(data: any) {
    try {
      console.log('Received onboarding data:', data);

      // 1. Check if user exists by email, if not create them
      let user = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            phone: data.phone,
            role: 'RIDER', // Explicitly set role to RIDER
            isOnline: false,
          }
        });
      }

      // 2. Create or Update the Rider Profile
      const profile = await this.prisma.riderProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName: data.fullName,
          bikeReg: data.licensePlate || data.bikeReg,
          bikeModel: data.bikeModel,
          nationalId: data.nationalId || null,
          emergencyContact: data.emergencyContact || null,
        },
        create: {
          userId: user.id,
          fullName: data.fullName,
          bikeReg: data.licensePlate || data.bikeReg,
          bikeModel: data.bikeModel,
          nationalId: data.nationalId || null,
          emergencyContact: data.emergencyContact || null,
        }
      });

      return { success: true, message: 'Application submitted successfully', profile };
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      throw new BadRequestException('Failed to save rider application: ' + error.message);
    }
  }
}

