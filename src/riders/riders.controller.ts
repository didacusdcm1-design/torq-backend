import { Controller, Post, Body, Patch, Param, Get, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
    // Extract text data from the form
    const { name, phone, email, plateNumber, bikeModel, nationalId, emergencyContact, bikeColor } = body;
    
    // Hash a default password (riders will reset it later)
    const defaultPassword = await bcrypt.hash('torq1234', 10);

    // Save User + Rider Profile to database
    const newUser = await this.prisma.user.create({
      data: {
        name: name,
        phone: phone,
        email: email,
        role: 'RIDER',
        password: defaultPassword,
        riderProfile: {
          create: {
            plateNumber: plateNumber,
            bikeModel: bikeModel,
            bikeColor: bikeColor || null,
            nationalId: nationalId || null,
            emergencyContact: emergencyContact || null,
            verificationStatus: 'PENDING_REVIEW',
            
            // Save file paths (replace backslashes with forward slashes for URLs)
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
      data: { verificationStatus: 'REJECTED', rejectionReason: body.reason },
    });
  }

  @Patch(':id/password')
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });
  }
}