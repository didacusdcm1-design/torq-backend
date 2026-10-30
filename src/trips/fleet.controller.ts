import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFleet() {
    // Fetch all riders who have a bike registered
    const riders = await this.prisma.user.findMany({
      where: { 
        role: 'RIDER',
        riderProfile: {
          bikeReg: { not: null } // Only show riders who have entered bike details
        }
      },
      include: {
        riderProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the data for the fleet table
    return riders.map(rider => ({
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
  }
}
