import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InterviewModule } from './modules/interview/interview.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './modules/interview/interview.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WebscraperModule } from './modules/webscraper/webscraper.module';

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
      url: process.env.postgres_uri,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Interview],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    InterviewModule,
    WebscraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
