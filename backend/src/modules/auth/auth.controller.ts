import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { Response } from 'express';

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
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  // 🌐 GOOGLE LOGIN
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // 🌐 CALLBACK
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(req.user);
    res.redirect(
      `http://localhost:3000/auth/google?token=${result.access_token}`,
    );
  }
}
