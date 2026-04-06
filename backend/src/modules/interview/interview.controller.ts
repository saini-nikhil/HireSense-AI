import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as ResumeFile } from '../../common/types/uploaded-file.type';
@Controller('interview')
export class InterviewController {
    constructor( private readonly interviewService: InterviewService) {}

@Post('start-interview')
@UseInterceptors(FileInterceptor('file'))
async startInterview(
  @UploadedFile() file: ResumeFile,
  @Body('userId') userId: string,
  @Body('jobDescription') jobDescription: string,
) {
    // console.log("file",file);
  return this.interviewService.startInterview(userId, file, jobDescription);
}
}
