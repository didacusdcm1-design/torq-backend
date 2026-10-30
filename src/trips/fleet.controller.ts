import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFleet() {
    // 1. Fetch all riders
    const riders = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Filter for those who actually have a bike registration
    const fleetData = riders
      .filter(rider => rider.riderProfile && rider.riderProfile.bikeReg)
      .map(rider => ({
        id: rider.id,
        riderName: rider.riderProfile?.fullName || rider.phone,
        riderPhone: rider.phone,
        bikeReg: rider.riderProfile?.bikeReg || 'N/A',
        bikeMake: rider.riderProfile?.bikeMake || 'N/A',
        bikeModel: rider.riderProfile?.bikeModel || 'N/A',
        bikeColor: rider.riderProfile?.bikeColor || 'N/A',
        verificationStatus: rider.riderProfile?.verificationStatus || 'PENDING_REVIEW',
        isOnline: rider.isOnline
      }));

    return fleetData;
  }
}
