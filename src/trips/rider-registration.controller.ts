import { Controller, Post, Body, UseGuards, Req, Patch, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || 'dfb0e62a-72b5-4899-8e1c-d78a4e60d9b6';
    const phone = body.phone || "0700000000"; 
    
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

  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    try {
      // 1. Try to find the profile first
      const existing = await this.prisma.riderProfile.findUnique({ where: { userId } });
      
      // 2. If it doesn't exist, create it as APPROVED
      if (!existing) {
        return await this.prisma.riderProfile.create({
          data: { userId: userId, verificationStatus: 'APPROVED' }
        });
      }

      // 3. If it exists, update it
      return await this.prisma.riderProfile.update({
        where: { userId: userId },
        data: { verificationStatus: 'APPROVED' }
      });
    } catch (error: any) {
      console.error("Approve Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body('reason') reason: string) {
    try {
      const existing = await this.prisma.riderProfile.findUnique({ where: { userId } });
      
      if (!existing) {
        return await this.prisma.riderProfile.create({
          data: { userId: userId, verificationStatus: 'REJECTED' }
        });
      }

      return await this.prisma.riderProfile.update({
        where: { userId: userId },
        data: { verificationStatus: 'REJECTED' }
      });
    } catch (error: any) {
      console.error("Reject Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

