import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InterviewModule } from './modules/interview/interview.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './modules/interview/interview.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'aws-1-ap-northeast-1.pooler.supabase.com', // from Supabase
      // port: 5432,
      // username: 'postgres.umcsdlwkzxbbkiscjiva',
      // password: 'v.wmk6*tYxSin7p',
      // database: 'postgres',
      url: 'postgresql://postgres.umcsdlwkzxbbkiscjiva:v.wmk6*tYxSin7p@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Interview],
      synchronize: true,
  autoLoadEntities: true,
    }),

    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
