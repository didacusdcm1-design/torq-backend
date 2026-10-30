import { Controller, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  // Temporarily public for registration
  @Post('register')
  async registerRider(@Body() body: any, @Req() req: any) {
    const phone = body.phone || "0700000000"; 
    
    // 1. Generate a random temporary password (e.g., TORQ-8392)
    const tempPassword = `TORQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Find or create user with the new password
    const user = await this.prisma.user.upsert({
      where: { phone: phone },
      update: { role: 'RIDER', password: hashedPassword },
      create: { phone: phone, role: 'RIDER', password: hashedPassword }
    });

    // 3. Upsert profile
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

    // 4. Return the plain text password so the frontend can display it (or admin can see it)
    return { message: 'Registration submitted', profile, temporaryPassword: tempPassword };
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/password')
  async resetPassword(@Param('id') id: string, @Body('password') newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }
}
