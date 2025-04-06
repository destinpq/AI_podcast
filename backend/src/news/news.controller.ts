import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';
import { IsString, IsNotEmpty } from 'class-validator';

class GenerateNewsDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('generate')
  async generateNews(@Body() generateNewsDto: GenerateNewsDto) {
    try {
      const result = await this.newsService.generateNews(generateNewsDto.topic);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate news',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 