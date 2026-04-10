import {
  Body,
  Controller,
  Req,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
const pdfParse = require('pdf-parse');

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start-interview')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async startInterview(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: ResumeFile,
    @Body('jobDescription') jobDescription: string,
  ) {
    let resumeText = '';
    if (file) {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    }
    const jd = jobDescription || 'Full Stack developer';

    return this.interviewService.startInterview(req.user.userId, resumeText, jd);
  }

  @Post('answer')
  @UseGuards(JwtAuthGuard)
  answer(@Body() body: any) {
    return this.interviewService.processAnswer(body);
  }
}
