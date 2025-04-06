import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

// Define DTOs (Data Transfer Objects) for validation
export class GenerateOutlineDto {
  topic: string;
  duration: number;
  memberCount: number;
}

// A more specific type for OpenAI errors if available, otherwise use a basic structure
interface OpenAIErrorResponse {
  data?: any;
}

interface PotentialError {
  response?: OpenAIErrorResponse;
}

@Injectable()
export class OutlineService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OutlineService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  // Helper function to handle OpenAI API calls with basic error handling
  private async callOpenAI(
    options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    description: string,
  ): Promise<string | null> {
    try {
      this.logger.log(`Calling OpenAI for ${description}...`);
      const completion = await this.openai.chat.completions.create(options);
      this.logger.log(`Successfully received ${description} from OpenAI.`);
      return completion.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Error calling OpenAI for ${description}:`, error);
      // Check if the error has a response structure
      if (error && typeof error === 'object' && 'response' in error) {
        const potentialError = error as PotentialError;
        if (potentialError.response?.data) {
          this.logger.error(
            'OpenAI Error Response Data:',
            potentialError.response.data,
          );
        }
      }
      // Re-throw a more specific error or handle as needed
      throw new HttpException(
        `Failed to get ${description} from OpenAI`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateOutline(generateOutlineDto: GenerateOutlineDto): Promise<any> {
    const { topic, duration, memberCount } = generateOutlineDto;
    this.logger.log(
      `Generating outline for topic: "${topic}", duration: ${duration}, members: ${memberCount}`,
    );

    if (!topic) {
      throw new HttpException('Topic is required', HttpStatus.BAD_REQUEST);
    }

    // 1. Research Phase
    const researchPrompt = `Research the topic "${topic}" and provide:
1. Latest trends and developments
2. Key controversies or debates
3. Recent statistics or studies
4. Expert opinions
5. Common misconceptions
6. Real-world examples or case studies

Format as a concise research brief with citations where possible.`;

    const research = await this.callOpenAI(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert researcher and podcast content strategist. Provide well-researched, factual information with a focus on recent developments and engaging angles.',
          },
          { role: 'user', content: researchPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      'research',
    );

    if (!research) {
      throw new HttpException(
        'Failed to generate research',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 2. Outline Generation Phase
    const outlinePrompt = `Using this research:

${research}

Create an engaging podcast outline for a ${duration}-minute discussion about "${topic}" with ${memberCount} speakers. The outline should be natural and conversational, including:

1. Opening Hook (2-3 min):
   - An attention-grabbing fact, story, or question
   - Brief speaker introductions that establish credibility
   - Why this topic matters right now

2. Main Discussion (${duration - 8} min):
   - Key narratives and storylines
   - Personal experiences and expert insights
   - Engaging debates and different perspectives
   - Real-world examples and case studies
   - Natural transitions between subtopics

3. Interactive Elements:
   - Questions for discussion between hosts
   - Hypothetical scenarios
   - Audience engagement points
   - Moments for personal stories
   - Points of humor or lighter discussion

4. Closing Segment (3-5 min):
   - Key takeaways
   - Call to action
   - Future implications
   - Personal reflections

For each section:
- Include specific talking points and questions
- Add timing suggestions
- Note potential guest expertise moments
- Suggest natural transition phrases
- Include points for audience engagement

Make it feel like a natural conversation between ${memberCount} knowledgeable friends, not a scripted lecture.`;

    const outline = await this.callOpenAI(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert podcast producer who specializes in creating natural, engaging conversation flows. Focus on making the discussion feel authentic and dynamic, while maintaining structure and value.',
          },
          { role: 'user', content: outlinePrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      },
      'outline',
    );

    if (!outline) {
      throw new HttpException(
        'Failed to generate outline',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 3. Hooks Generation Phase
    const hooksPrompt = `For this podcast outline:

${outline}

Generate:
1. 3-5 compelling "hook" questions to spark discussion
2. 2-3 controversial or debatable points to explore
3. 2-3 personal story prompts for hosts
4. 2-3 audience engagement questions
5. 2-3 relevant current events to reference
6. 2-3 expert insights or statistics to share
7. 2-3 common misconceptions to address
8. 2-3 practical takeaways or action items`;

    const hooks = await this.callOpenAI(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in audience engagement and podcast dynamics. Focus on elements that will make the discussion more interactive and memorable.',
          },
          { role: 'user', content: hooksPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      },
      'hooks',
    );

    if (!hooks) {
      throw new HttpException(
        'Failed to generate hooks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.log(
      `Successfully generated outline, research, and hooks for topic: "${topic}"`,
    );
    return {
      outline,
      research,
      hooks,
      suggestedStructure: {
        duration,
        memberCount,
        topic,
        sections: [
          { type: 'opening', duration: 3 },
          { type: 'main', duration: duration - 8 },
          { type: 'closing', duration: 5 },
        ],
      },
    };
  }
}
