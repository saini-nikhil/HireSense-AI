import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start-interview')
  @UseInterceptors(FileInterceptor('file'))
  async startInterview(
    @UploadedFile() file: ResumeFile,
    @Body('userId') userId: string,
    @Body('jobDescription') jobDescription: string,
  ) {
    const resumeText = file?.buffer?.toString('utf-8') ?? '';
    // console.log('resumeText', resumeText);
    const jd = jobDescription || 'Full Stack developer';

    return this.interviewService.startInterview(resumeText, jd);
  }

  // @Post('start')
  // startInterview(@Body() body: any) {
  //   return this.interviewService.startInterview(body);
  // }
  @Post('answer')
  answer(@Body() body: any) {
    return this.interviewService.processAnswer(body);
  }
}
