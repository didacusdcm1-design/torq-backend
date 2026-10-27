import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TripsService } from './trips.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('request')
  create(@Body() body: any, @Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.createTrip(body, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  getHistory(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getUserTrips(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pending')
  getPendingTrips(@Req() req: any) {
    const riderId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getPendingTrips(riderId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('accept/:id')
  acceptTrip(@Param('id') id: string, @Req() req: any) {
    const riderId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.acceptTrip(id, riderId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('status/:id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tripsService.updateStatus(id, status);
  }

  @Get('admin/all')
  async getAllTripsForAdmin(@Query('search') search?: string) {
    return this.tripsService.getAllTripsForAdmin(search);
  }

  @Get('admin/users')
  async getAllUsersForAdmin() {
    return this.tripsService.getAllUsersForAdmin();
  }

  @Patch('admin/users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.tripsService.updateUserRole(id, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('rider/full-profile')
  async updateFullProfile(@Body() body: any, @Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.updateFullProfile(userId, body);
  }

  @Patch('admin/riders/:id/approve')
  async approveRider(@Param('id') id: string) {
    return this.tripsService.approveRider(id);
  }

  // FILE UPLOAD ENDPOINT
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
    // Returns the full URL pointing to the Render backend
    return { url: `https://torq-backend.onrender.com/uploads/${file.filename}` };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rider/wallet')
  async getWallet(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getWallet(userId);
  }

  @Patch('admin/riders/:id/reject')
  async rejectRider(@Param('id') id: string, @Body('reason') reason: string) {
    return this.tripsService.rejectRider(id, reason);
  }
}
