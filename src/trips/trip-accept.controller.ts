import { Controller, Patch, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class TripAcceptController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('accept/:id')
  async acceptTrip(@Param('id') id: string, @Req() req: any) {
    const riderId = req.user?.userId || req.user?.id || req.user?.sub;
    
    // Fallback for testing if no rider is logged in
    const rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
    const finalRiderId = riderId || rider?.id;

    if (!finalRiderId) throw new NotFoundException('No rider found to assign.');

    return this.prisma.trip.update({
      where: { id },
      data: { 
        status: 'ACCEPTED',
        riderId: finalRiderId
      },
    });
  }
}