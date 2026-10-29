import { Controller, Post, Body, UseGuards, Req, Patch, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for testing
  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || 'dfb0e62a-72b5-4899-8e1c-d78a4e60d9b6';
    const phone = body.phone || "0700000000"; 
    
    // Find or create user
    const user = await this.prisma.user.upsert({
      where: { phone: phone },
      update: { role: 'RIDER' },
      create: { phone: phone, role: 'RIDER', password: "password123" }
    });

    const profile = await this.prisma.riderProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: body.fullName, nationalId: body.nationalId, licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, bikeMake: body.bikeMake, bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, bikeReg: body.bikeReg, selfieUrl: 'https://mock.com', licenseDocUrl: 'https://mock.com',
        verificationStatus: 'PENDING_REVIEW',
      },
      create: {
        userId: user.id,
        fullName: body.fullName, nationalId: body.nationalId, licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, bikeMake: body.bikeMake, bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, bikeReg: body.bikeReg, selfieUrl: 'https://mock.com', licenseDocUrl: 'https://mock.com',
        verificationStatus: 'PENDING_REVIEW',
      }
    });

    return { message: 'Registration submitted', profile };
  }

  // FIX: Use upsert for approve to prevent crashes
  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    return this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: { verificationStatus: 'APPROVED' },
      create: { userId: userId, verificationStatus: 'APPROVED' }
    });
  }

  // FIX: Use upsert for reject to prevent crashes
  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: { verificationStatus: 'REJECTED' },
      create: { userId: userId, verificationStatus: 'REJECTED' }
    });
  }
}
