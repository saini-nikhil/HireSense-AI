import { Module } from '@nestjs/common';
import { WebscraperService } from './webscraper.service';
import { WebscraperController } from './webscraper.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WebscraperService],
  controllers: [WebscraperController],
})
export class WebscraperModule {}
