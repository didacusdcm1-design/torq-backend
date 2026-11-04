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
    try {
      console.log("=== NEW REGISTRATION ===");
      console.log("Body:", body);
      console.log("Files received:", files);

      const newUser = await this.prisma.user.create({
        data: {
          phone: body.phone || `phone_${Date.now()}`, // Fallback if empty
          email: body.email || null,
          role: 'RIDER',
          password: 'temporary_password', 
          riderProfile: {
            create: {
              fullName: body.name || body.fullName || 'Unknown',
              nationalId: body.nationalIdText || null,
              emergencyContact: body.emergencyContact || null,
              bikeMake: 'Unknown',
              bikeModel: body.bikeModel || null,
              bikeColor: body.bikeColor || null,
              licenseNumber: body.plateNumber || null,
              verificationStatus: 'PENDING_REVIEW',
              
              licenseDocUrl: files.driversLicense ? files.driversLicense[0].path.replace(/\\/g, '/') : null,
              insuranceDocUrl: files.insurance ? files.insurance[0].path.replace(/\\/g, '/') : null,
              bikePhotoUrl: files.bikePicture ? files.bikePicture[0].path.replace(/\\/g, '/') : null,
              selfieUrl: files.passportPhoto ? files.passportPhoto[0].path.replace(/\\/g, '/') : null,
            }
          }
        }
      });

      console.log("SUCCESS: User created", newUser.id);
      return { message: 'Registration successful', userId: newUser.id };
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);
      throw error;
    }
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
    // For now, we just save what we can. 
    // Note: Your Flutter app needs to send fullName, nationalId, emergencyContact, bikeColor, etc.
    const newUser = await this.prisma.user.create({
      data: {
        
        phone: body.phone || '0000000000',
        email: body.email || null,
        role: 'RIDER',
        password: 'temporary_password', 
        riderProfile: {
          create: {
            fullName: body.fullName || body.name || 'Unknown',
            nationalId: body.nationalIdText || body.nationalId || null,
            emergencyContact: body.emergencyContact || null,
            bikeMake: body.bikeMake || 'Unknown',
            bikeModel: body.bikeModel || null,
            bikeColor: body.bikeColor || null,
            licenseNumber: body.plateNumber || body.licenseNumber || null,
            
            // Save the image paths
            licenseDocUrl: files.driversLicense ? files.driversLicense[0].path.replace(/\\/g, '/') : null,
            insuranceDocUrl: files.insurance ? files.insurance[0].path.replace(/\\/g, '/') : null,
            bikePhotoUrl: files.bikePicture ? files.bikePicture[0].path.replace(/\\/g, '/') : null,
            selfieUrl: files.passportPhoto ? files.passportPhoto[0].path.replace(/\\/g, '/') : null,
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
      data: { verificationStatus: 'REJECTED', rejectionReason: body.reason || 'No reason' },
    });
  }

  @Patch(':id/password')
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.prisma.user.update({
      where: { id: id },
      data: { password: body.password }, 
    });
  }
}