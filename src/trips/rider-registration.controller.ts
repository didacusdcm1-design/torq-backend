import { Controller, Post, Body, UseGuards, Req, Patch, Param, NotFoundException, InternalServerErrorException, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. GET ALL RIDERS (Fetch fresh data directly)
  @Get()
  async getAllRiders() {
    return this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 2. REGISTER RIDER
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
        fullName: body.fullName, 
        nationalId: body.nationalId, 
        licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, 
        bikeMake: body.bikeMake, 
        bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, 
        bikeReg: body.bikeReg, 
        selfieUrl: 'https://mock.com', 
        licenseDocUrl: 'https://mock.com',
        verificationStatus: 'PENDING_REVIEW',
      },
      create: {
        userId: user.id,
        fullName: body.fullName, 
        nationalId: body.nationalId, 
        licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, 
        bikeMake: body.bikeMake, 
        bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, 
        bikeReg: body.bikeReg, 
        selfieUrl: 'https://mock.com', 
        licenseDocUrl: 'https://mock.com',
        verificationStatus: 'PENDING_REVIEW',
      }
    });

    return { message: 'Registration submitted', profile };
  }

  // 3. APPROVE RIDER (Raw SQL Force Update)
  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    try {
      await this.prisma.$executeRaw`
        UPDATE "RiderProfile" 
        SET "verificationStatus" = 'APPROVED' 
        WHERE "userId" = ${userId}
      `;
      return { message: 'Approved successfully' };
    } catch (error: any) {
      console.error("Approve Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // 4. REJECT RIDER (Raw SQL Force Update)
  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body('reason') reason: string) {
    try {
      await this.prisma.$executeRaw`
        UPDATE "RiderProfile" 
        SET "verificationStatus" = 'REJECTED' 
        WHERE "userId" = ${userId}
      `;
      return { message: 'Rejected successfully' };
    } catch (error: any) {
      console.error("Reject Error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
