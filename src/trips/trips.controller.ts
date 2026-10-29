import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TripsService } from './trips.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async getAllTrips(@Query('search') search?: string) {
    return this.tripsService.findAll(search);
  }

  // --- THE MISSING ENDPOINT ---
  @Get(':id')
  async getTripById(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
  // ----------------------------

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

  @Patch('admin/riders/:id/reject')
  async rejectRider(@Param('id') id: string, @Body('reason') reason: string) {
    return this.tripsService.rejectRider(id, reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rider/history')
  async getRiderHistory(@Req() req: any) {
    const riderId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getRiderHistory(riderId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rider/notifications')
  async getNotifications(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getNotifications(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('rider/payout')
  async requestPayout(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.requestPayout(userId);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Get('rider/wallet')
  async getWallet(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.tripsService.getWallet(userId);
  }

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
}
