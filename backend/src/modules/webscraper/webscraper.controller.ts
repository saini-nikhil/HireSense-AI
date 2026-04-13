import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import pdfParse = require('pdf-parse');

import { WebscraperService } from './webscraper.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
import { WebscraperDto } from './webscraper.dto';

@Controller('webscraper')
export class WebscraperController {
  constructor(private readonly webscraperService: WebscraperService) {}

  @Post('jobs')
  @UseInterceptors(FileInterceptor('file'))
  async webscraper(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: ResumeFile,
    @Body() body: WebscraperDto,
  ) {
    try {
      const { jobDescription, location } = body;

      let resumeText = '';

      if (file) {
        const data = await pdfParse(file.buffer);
        resumeText = data.text;
      }

      return this.webscraperService.webscraper(
        resumeText,
        jobDescription,
        location,
      );
    } catch (error: any) {
      console.error(error);
      return { error: error.message };
    }
  }
}
