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
import pdfParse = require('pdf-parse');
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

interface AnswerRequestBody {
  sessionId: string;
  answer: string;
}

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
    console.log(req.user.userId, jd);
    return this.interviewService.startInterview(
      req.user.userId,
      resumeText,
      jd,
    );
  }

  @Post('answer')
  @UseGuards(JwtAuthGuard)
  answer(@Req() req: AuthenticatedRequest, @Body() body: AnswerRequestBody) {
    return this.interviewService.processAnswer(
      req.user.userId,
      body.sessionId,
      body.answer,
    );
  }
}
