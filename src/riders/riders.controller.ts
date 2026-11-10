import { Controller, Get } from '@nestjs/common';
import { RidersService } from './riders.service';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  findAll() {
    return this.ridersService.findAll();
  }
}
