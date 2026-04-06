import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview])],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [TypeOrmModule],
})
export class InterviewModule {}
