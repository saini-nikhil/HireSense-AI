import { Body, Controller, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('generate-pdf')
  async generatePdf(@Body() body: any, @Res() res: Response) {
    const pdf = await this.usersService.generatePdf(body);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
    });

    res.send(pdf);
  }
}
