import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param } from '@nestjs/common';
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

  // ADDED FOR ADMIN DASHBOARD
  @Get('admin/all')
  async getAllTripsForAdmin() {
    return this.tripsService.getAllTripsForAdmin();
  }
}
