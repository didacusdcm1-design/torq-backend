import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { RidersService } from './riders.service';
import { UpdateRiderStatusDto } from './dto/update-rider-status.dto';

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
    @Body() updateRiderStatusDto: UpdateRiderStatusDto,
  ) {
    return this.ridersService.updateStatus(id, updateRiderStatusDto.status);
  }
}
