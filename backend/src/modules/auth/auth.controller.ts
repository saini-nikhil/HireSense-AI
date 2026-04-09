import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(@Body() body) {
    const user = await this.authService.signup(body);
    return this.authService.login(user);
  }

  // 🔑 LOGIN
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req) {
    console.log('req.user', req.user);
    return this.authService.login(req.user);
  }

  // 🌐 GOOGLE LOGIN
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // 🌐 CALLBACK
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Request() req) {
    console.log('req.user', req.user);
    return this.authService.login(req.user);
  }
}
