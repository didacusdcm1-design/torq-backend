import { Controller, Post, Body, Get, Param, Query, NotFoundException } from '@nestjs/common';
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

  // TEMPORARILY PUBLIC FOR TESTING: No @UseGuards here!
  @UseGuards(AuthGuard('jwt'))
  @Post('dispatch')
  async dispatchRide(@Body() body: any) {
    // Find the first customer in the database for testing
    const customer = await this.tripsService['prisma'].user.findFirst({ where: { role: 'CUSTOMER' } });
    
    // Prevent the null crash
    if (!customer) {
      throw new NotFoundException('No customers found in the database. Please register a customer first.');
    }
    
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


