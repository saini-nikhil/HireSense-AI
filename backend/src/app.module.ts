import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InterviewModule } from './modules/interview/interview.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './modules/interview/interview.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-1-ap-southeast-2.pooler.supabase.com', // from Supabase
      port: 5432,
      username: 'postgres.hvzcbihvtizqfjnpfucn',
      password: 'NCc6twHzyX&B5Uw',
      database: 'ai',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Interview],
      synchronize: true,
    }),

    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
