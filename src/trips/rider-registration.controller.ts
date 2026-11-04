import { Controller, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Controller('riders')
export class RiderRegistrationController {
  constructor(private readonly prisma: PrismaService) {}

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
  async registerRider(
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
      console.log("=== REGISTRATION ATTEMPT ===");
      console.log("Body:", body);
      console.log("Files:", files ? Object.keys(files) : "None");

      // Safe fallback for phone
      let finalPhone = body?.phone || `phone_${Date.now()}`;
      
      // Check for duplicate phone
      const existingUser = await this.prisma.user.findUnique({ where: { phone: finalPhone } });
      if (existingUser) {
        finalPhone = finalPhone + '_' + Math.floor(Math.random() * 1000);
      }

      const newUser = await this.prisma.user.create({
        data: {
          phone: finalPhone,
          email: body?.email || null,
          role: 'RIDER',
          password: 'temporary_password', 
          riderProfile: {
            create: {
              fullName: body?.name || body?.fullName || 'Unknown',
              nationalId: body?.nationalIdText || null,
              emergencyContact: body?.emergencyContact || null,
              bikeMake: 'Unknown',
              bikeModel: body?.bikeModel || null,
              bikeColor: body?.bikeColor || null,
              licenseNumber: body?.plateNumber || null,
              verificationStatus: 'PENDING_REVIEW',
              
              licenseDocUrl: files?.driversLicense ? files.driversLicense[0].path.replace(/\\/g, '/') : null,
              insuranceDocUrl: files?.insurance ? files.insurance[0].path.replace(/\\/g, '/') : null,
              bikePhotoUrl: files?.bikePicture ? files.bikePicture[0].path.replace(/\\/g, '/') : null,
              selfieUrl: files?.passportPhoto ? files.passportPhoto[0].path.replace(/\\/g, '/') : null,
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
  }
}