import { Controller, Patch, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('riders')
export class RiderStatusController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('status')
  async updateStatus(@Body() body: any) {
    try {
      // 1. Find ANY rider in the database to act as the logged-in user
      let rider = await this.prisma.user.findFirst({ where: { role: 'RIDER' } });
      
      // 2. If no rider exists, create one automatically
      if (!rider) {
        rider = await this.prisma.user.create({
          data: {
            phone: "0700000000",
            role: 'RIDER',
            password: "password123"
          }
        });
      }

      // 3. Update the status
      return await this.prisma.user.update({
        where: { id: rider.id },
        data: {
          isOnline: body.isOnline,
          currentLat: body.isOnline ? -1.2650 : null, 
          currentLng: body.isOnline ? 36.8030 : null,
        },
      });
    } catch (error: any) {
      console.error("Status Update Error:", error);
      return { success: false, message: error.message };
    }
  }
}
