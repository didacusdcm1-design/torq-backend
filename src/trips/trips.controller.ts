import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Query, NotFoundException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly dispatchService: DispatchService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  async getAllTrips(@Query('search') search?: string) {
    return this.tripsService.findAll(search);
  }

  @Get('rider/active')
  async getRiderActiveTrips(@Req() req: any) {
    const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
    if (!rider) return [];
    return this.prisma.trip.findMany({
      where: { riderId: rider.id, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
      include: { customer: true }
    });
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  // SECURED: Only authenticated customers can dispatch
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
