import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class CustomerActiveTripController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('customer/active')
  async getCustomerActiveTrip(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    
    // Find a trip that is not completed or cancelled
    const trip = await this.prisma.trip.findFirst({
      where: {
        customerId: userId,
        status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS_DEST'] }
      },
      include: {
        rider: {
          include: { riderProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return trip;
  }
}
