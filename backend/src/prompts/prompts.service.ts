import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class PromptsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generatePrompts(params: {
    topic: string;
    duration: number;
    memberCount: number;
    style: string;
    format: string;
    requirements: string;
  }) {
    const { topic, duration, memberCount, style, format, requirements } = params;

    if (!topic || !duration || !memberCount || !style || !format) {
      throw new Error('Missing required parameters');
    }

    // Define style-specific instructions
    let styleInstruction = '';
    if (style === 'expert') {
      styleInstruction = 'Provide detailed, authoritative insights that showcase deep knowledge of the topic.';
    } else if (style === 'storyteller') {
      styleInstruction = 'Craft engaging narratives that captivate the audience and illustrate key points through stories.';
    } else if (style === 'educator') {
      styleInstruction = 'Explain concepts clearly, breaking down complex ideas into digestible parts for the audience.';
    }

    // Research summary prompt
    const researchPrompt = [
      {
        role: 'system' as const,
        content: 'You are a knowledgeable podcast research assistant.'
      },
      {
        role: 'user' as const,
        content: `I need a concise research summary for a ${duration}-minute podcast with ${memberCount} speakers about "${topic}". 
        The podcast format is ${format}. ${styleInstruction}
        ${requirements ? `Additional requirements: ${requirements}` : ''}
        Provide a research summary with key facts, statistics, and background information that would be helpful for the podcast hosts.`
      }
    ];

    // Outline prompt
    const outlinePrompt = [
      {
        role: 'system' as const,
        content: 'You are a podcast content strategist who creates effective episode outlines.'
      },
      {
        role: 'user' as const,
        content: `I need an outline for a ${duration}-minute podcast with ${memberCount} speakers about "${topic}". 
        The podcast format is ${format}. ${styleInstruction}
        ${requirements ? `Additional requirements: ${requirements}` : ''}
        Create a structured outline with sections for introduction, main discussion points, and conclusion. Include timing suggestions for each section.`
      }
    ];

    // Engagement prompt
    const engagementPrompt = [
      {
        role: 'system' as const,
        content: 'You are an expert at creating engaging hooks and questions for podcasts.'
      },
      {
        role: 'user' as const,
        content: `I need engaging hooks and questions for a ${duration}-minute podcast with ${memberCount} speakers about "${topic}". 
        The podcast format is ${format}. ${styleInstruction}
        ${requirements ? `Additional requirements: ${requirements}` : ''}
        Generate 5 compelling hooks to start the episode and 10 thought-provoking questions to discuss during the podcast.`
      }
    ];

    try {
      // Generate research summary
      const researchResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: researchPrompt,
      });
      const researchSummary = researchResponse.choices[0].message.content;

      // Generate outline
      const outlineResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: outlinePrompt,
      });
      const outline = outlineResponse.choices[0].message.content;

      // Generate engagement hooks
      const engagementResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: engagementPrompt,
      });
      const engagement = engagementResponse.choices[0].message.content;

      return {
        research: researchSummary,
        outline: outline,
        engagement: engagement,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate prompts: ${error.message}`);
    }
  }
} 