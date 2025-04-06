import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class NewsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateNews(topic: string) {
    if (!topic) {
      throw new Error('Topic is required');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system' as const,
            content: 'You are a creative journalist who writes fictional news articles.'
          },
          {
            role: 'user' as const,
            content: `Write 3 brief fictional news headlines and summaries about "${topic}". 
            Make them creative and interesting. For each news item include: 
            1. A catchy headline 
            2. A brief summary (2-3 sentences) 
            3. A source (fictional news organization)
            4. A thumbnail description that would make sense for the article

            Respond in JSON format with an array of news objects that have headline, summary, source, and thumbnail fields.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('Failed to generate news content');
      }

      try {
        return JSON.parse(content);
      } catch (error) {
        // If JSON parsing fails, return the raw content
        return { 
          error: 'Failed to parse JSON response', 
          rawContent: content 
        };
      }
    } catch (error) {
      throw new Error(`Failed to generate news: ${error.message}`);
    }
  }
} 