import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: any) {
    // Extract phone and password from the request body
    const { phone, password } = dto;
    
    if (!phone || !password) {
      throw new UnauthorizedException('Phone and password are required');
    }

    // Pass them as two separate arguments to match the service
    return this.authService.login(phone, password);
  }

  @Post('register')
  async register(@Body() dto: any) {
    return this.authService.register(dto);
  }
}
