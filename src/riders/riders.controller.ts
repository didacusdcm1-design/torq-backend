import { Controller, Post, Body, Patch, Param, Get, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Controller('riders')
export class RidersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllRiders() {
    return this.prisma.user.findMany({
      where: { role: 'RIDER' },
      include: { riderProfile: true },
    });
  }

  @Post('register')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'nationalId', maxCount: 1 },
    { name: 'driversLicense', maxCount: 1 },
    { name: 'bikePicture', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async register(
    @Body() body: any, 
    @UploadedFiles() files: { 
      nationalId?: Express.Multer.File[], 
      driversLicense?: Express.Multer.File[], 
      bikePicture?: Express.Multer.File[], 
      passportPhoto?: Express.Multer.File[], 
      insurance?: Express.Multer.File[] 
    }
  ) {
    const { name, phone, email, plateNumber, bikeModel, nationalIdText, emergencyContact, bikeColor } = body;

    // Save User + Rider Profile to database
    const newUser = await this.prisma.user.create({
      data: {
        name: name || 'Unknown',
        phone: phone || '0000000000',
        email: email || null,
        role: 'RIDER',
        password: 'temporary_password', // You should hash this in production
        riderProfile: {
          create: {
            plateNumber: plateNumber || null,
            bikeModel: bikeModel || null,
            bikeColor: bikeColor || null,
            nationalId: nationalIdText || null,
            emergencyContact: emergencyContact || null,
            verificationStatus: 'PENDING',
            
            nationalIdUrl: files.nationalId ? files.nationalId[0].path.replace(/\\/g, '/') : null,
            driversLicenseUrl: files.driversLicense ? files.driversLicense[0].path.replace(/\\/g, '/') : null,
            bikePictureUrl: files.bikePicture ? files.bikePicture[0].path.replace(/\\/g, '/') : null,
            passportPhotoUrl: files.passportPhoto ? files.passportPhoto[0].path.replace(/\\/g, '/') : null,
            insuranceUrl: files.insurance ? files.insurance[0].path.replace(/\\/g, '/') : null,
          }
        }
      }
    });

    return { message: 'Registration successful', userId: newUser.id };
  }

  @Patch('approve/:userId')
  async approveRider(@Param('userId') userId: string) {
    return this.prisma.riderProfile.update({
      where: { userId: userId },
      data: { verificationStatus: 'APPROVED' },
    });
  }

  @Patch('reject/:userId')
  async rejectRider(@Param('userId') userId: string, @Body() body: { reason: string }) {
    return this.prisma.riderProfile.update({
      where: { userId: userId },
      data: { verificationStatus: 'REJECTED', rejectionReason: body.reason || 'No reason provided' },
    });
  }

  @Patch(':id/password')
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.prisma.user.update({
      where: { id: id },
      data: { password: body.password }, // Hash this in production!
    });
  }
}