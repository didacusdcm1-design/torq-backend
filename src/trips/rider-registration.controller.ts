import { Controller, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for testing
  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    // 1. Find or Create the user safely (for testing without login)
    const phone = body.phone || "0700000000"; 
    const user = await this.prisma.user.upsert({
      where: { phone: phone },
      update: { role: 'RIDER' },
      create: { 
        phone: phone, 
        role: 'RIDER',
        password: "password123",
      }
    });
    
    // THIS WAS MISSING
    const finalUserId = user.id;

    // 2. Upsert the RiderProfile using the correct ID
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

  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    return this.prisma.riderProfile.update({
      where: { userId: userId },
      data: { verificationStatus: 'APPROVED' },
    });
  }
  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.prisma.riderProfile.update({
      where: { userId: userId },
      data: { 
        verificationStatus: 'REJECTED',
        // In a production app, you would save the reason to an AuditLog table
      },
    });
  }
}

