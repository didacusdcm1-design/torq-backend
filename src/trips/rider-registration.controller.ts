import { Controller, Post, Body, Patch, Param, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as bcrypt from 'bcrypt';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllRiders() {
    return this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- THE MISSING UPLOAD ENDPOINT ---
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `https://torq-backend.onrender.com/uploads/${file.filename}` };
  }
  // -----------------------------------

  @Post('register')
  async registerRider(@Body() body: any) {
    const phone = body.phone;
    const tempPassword = `TORQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.upsert({
      where: { phone: phone },
      update: { role: 'RIDER', password: hashedPassword },
      create: { phone: phone, role: 'RIDER', password: hashedPassword }
    });

    const profile = await this.prisma.riderProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: body.fullName, nationalId: body.nationalId, licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, bikeMake: body.bikeMake, bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, bikeReg: body.bikeReg,
        selfieUrl: body.selfieUrl, licenseDocUrl: body.licenseDocUrl, insuranceDocUrl: body.insuranceDocUrl, bikePhotoUrl: body.bikePhotoUrl,
        verificationStatus: 'PENDING_REVIEW',
      },
      create: {
        userId: user.id,
        fullName: body.fullName, nationalId: body.nationalId, licenseNumber: body.licenseNumber,
        emergencyContact: body.emergencyContact, bikeMake: body.bikeMake, bikeModel: body.bikeModel,
        bikeColor: body.bikeColor, bikeReg: body.bikeReg,
        selfieUrl: body.selfieUrl, licenseDocUrl: body.licenseDocUrl, insuranceDocUrl: body.insuranceDocUrl, bikePhotoUrl: body.bikePhotoUrl,
        verificationStatus: 'PENDING_REVIEW',
      }
    });

    return { message: 'Registration submitted', profile, temporaryPassword: tempPassword };
  }

  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    return this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: { verificationStatus: 'APPROVED' },
      create: { userId: userId, verificationStatus: 'APPROVED' }
    });
  }

  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body('reason') reason: string) {
    return this.prisma.riderProfile.upsert({
      where: { userId: userId },
      update: { verificationStatus: 'REJECTED' },
      create: { userId: userId, verificationStatus: 'REJECTED' }
    });
  }

  @Patch(':id/password')
  async resetPassword(@Param('id') id: string, @Body('password') newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  }
}