import { Controller, UseInterceptors, UploadedFiles, Get, Patch, Param, Body, Query } } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RidersService } from './riders.service';

@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.ridersService.findAll(search);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.ridersService.reject(id, reason);
  }
}
