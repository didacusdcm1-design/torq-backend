import { Controller, Get, Query } from '@nestjs/common';
import { RidersService } from './riders.service';
import { GetRidersDto } from './dto/get-riders.dto';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  findAll(@Query() query: GetRidersDto) {
    return this.ridersService.findAll(query);
  }
}
