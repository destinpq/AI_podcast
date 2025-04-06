import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class FactsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateFacts(topic: string, count: number = 5) {
    if (!topic) {
      throw new Error('Topic is required');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system' as const,
            content: 'You are a helpful assistant that provides interesting and educational facts.'
          },
          {
            role: 'user' as const,
            content: `Generate ${count} interesting facts about "${topic}". 
            Make them educational, surprising, and engaging.
            Each fact should be concise but informative.
            Respond in JSON format with an array of fact objects, each with a "fact" property.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('Failed to generate facts content');
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
      throw new Error(`Failed to generate facts: ${error.message}`);
    }
  }
} 