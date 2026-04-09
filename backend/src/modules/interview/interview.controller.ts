import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
import { AuthGuard } from '@nestjs/passport';
const pdfParse = require('pdf-parse');

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start-interview')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async startInterview(
    @UploadedFile() file: ResumeFile,
    @Body('userId') userId: string,
    @Body('jobDescription') jobDescription: string,
  ) {
    let resumeText = '';
    if (file) {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    }
    const jd = jobDescription || 'Full Stack developer';

    return this.interviewService.startInterview(resumeText, jd);
  }

  @Post('answer')
  answer(@Body() body: any) {
    return this.interviewService.processAnswer(body);
  }
}
