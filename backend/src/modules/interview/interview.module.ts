import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { InterviewSession } from 'src/database/interviewsession.entity';
import { InterviewMessage } from 'src/database/interview-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, InterviewMessage, InterviewSession]),
    AuthModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService, AiService],
  exports: [TypeOrmModule],
})
export class InterviewModule {}
