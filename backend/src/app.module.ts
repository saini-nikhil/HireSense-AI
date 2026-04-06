import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DEFAULT_MONGODB_URI } from './database/mongodb.constants';
import { InterviewModule } from './modules/interview/interview.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? DEFAULT_MONGODB_URI,
    ),
    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
