import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { DispatchService } from './dispatch.service';

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

  // TEMPORARILY PUBLIC FOR TESTING: No @UseGuards here!
  @Post('dispatch')
  async dispatchRide(@Body() body: any) {
    // Fallback to the first customer in the database for testing
    const customer = await this.tripsService['prisma'].user.findFirst({ where: { role: 'CUSTOMER' } });
    
    return this.dispatchService.dispatchRide(
      customer.id,
      Number(body.pickupLat),
      Number(body.pickupLng),
      Number(body.dropoffLat),
      Number(body.dropoffLng),
      Number(body.distanceKm),
      Number(body.durationMins)
    );
  }
}
