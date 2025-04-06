import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';

@Module({
  imports: [ConfigModule],
  providers: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {} 