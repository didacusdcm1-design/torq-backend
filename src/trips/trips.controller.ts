import { Controller, Post, Body, Get, Param, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { TripsService } from './trips.service';
import { DispatchService } from './dispatch.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly dispatchService: DispatchService
  ) {}

  @Get()
  async getAllTrips(@Query('search') search?: string) {
    return this.tripsService.findAll(search);
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  // SECURED AGAIN: The AuthGuard is back. Only logged-in users can dispatch.
  @UseGuards(AuthGuard('jwt'))
  @Post('dispatch')
  async dispatchRide(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    
    return this.dispatchService.dispatchRide(
      userId,
      Number(body.pickupLat),
      Number(body.pickupLng),
      Number(body.dropoffLat),
      Number(body.dropoffLng),
      Number(body.distanceKm),
      Number(body.durationMins)
    );
  }
}
