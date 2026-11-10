import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { RidersService } from './riders.service';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get('pending')
  findPending() {
    return this.ridersService.findPending();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.ridersService.updateStatus(id, body.status);
  }
}
