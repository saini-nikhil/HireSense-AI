import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewSchema } from './interview.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Interview', schema: InterviewSchema },
    ]),
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
