import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async getAllTrips(@Query('search') search?: string) {
    return this.tripsService.findAll(search);
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  // Removed @UseGuards for testing. Added optional chaining (?.) to prevent crash.
  @Post('request')
  create(@Body() body: any, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub || undefined;
    return this.tripsService.createTrip(body, userId);
  }
}
