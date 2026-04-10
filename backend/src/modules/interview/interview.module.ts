import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), AuthModule],
  controllers: [InterviewController],
  providers: [InterviewService, AiService],
  exports: [TypeOrmModule],
})
export class InterviewModule {}
