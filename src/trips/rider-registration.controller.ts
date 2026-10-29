import { Controller, Post, Body, UseGuards, Req, Patch, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for testing
  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    // 1. Use a fallback test user ID if not logged in
    const userId = req.user?.userId || req.user?.id || req.user?.sub || 'dfb0e62a-72b5-4899-8e1c-d78a4e60d9b6';

    // 2. Find or Create the user safely (for testing without login)
    const phone = body.phone || "0700000000"; // Fallback phone
    const user = await this.prisma.user.upsert({
      where: { phone: phone },
      update: { role: 'RIDER' },
      create: { 
        phone: phone, 
        role: 'RIDER',
        password: "password123",
      }
    });
    const finalUserId = user.id;

    // 4. Upsert the RiderProfile
    const profile = await this.prisma.riderProfile.upsert({
      where: { userId: finalUserId },
      update: {
        fullName: body.fullName,
        nationalId: body.nationalId,
        licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact,
        bikeMake: body.bikeMake,
        bikeModel: body.bikeModel,
        bikeColor: body.bikeColor,
        bikeReg: body.bikeReg,
        selfieUrl: 'https://mock-selfie-url.com',
        licenseDocUrl: 'https://mock-doc-url.com',
        verificationStatus: 'PENDING_REVIEW',
      },
      create: {
        userId: finalUserId,
        fullName: body.fullName,
        nationalId: body.nationalId,
        licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact,
        bikeMake: body.bikeMake,
        bikeModel: body.bikeModel,
        bikeColor: body.bikeColor,
        bikeReg: body.bikeReg,
        selfieUrl: 'https://mock-selfie-url.com',
        licenseDocUrl: 'https://mock-doc-url.com',
        verificationStatus: 'PENDING_REVIEW',
      }
    });

    return { message: 'Registration submitted for review', profile };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    return this.prisma.riderProfile.update({
      where: { userId: finalUserId },
      data: { verificationStatus: 'APPROVED' },
    });
  }
}

