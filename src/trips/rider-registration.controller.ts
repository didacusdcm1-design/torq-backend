import { Controller, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    // Update User role AND Full Name
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'RIDER',
        email: body.fullName ? `${body.fullName.replace(/\s+/g, '').toLowerCase()}@torq.com` : undefined // Temporary hack to store name if no name field exists
      }
    });

    const profile = await this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: {
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
        userId: userId,
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
      where: { userId: userId },
      data: { verificationStatus: 'APPROVED' },
    });
  }
}
