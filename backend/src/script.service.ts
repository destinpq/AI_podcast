import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

// Define a more specific type for the outline format
interface OutlineFormat {
  style?: string;
  tone?: string;
}

// Define a more specific type for the outline object
interface ScriptOutline {
  format?: OutlineFormat;
  // Add other expected properties of the outline object here
  [key: string]: any; // Allow other properties if needed
}

// Define DTOs
export class GenerateScriptDto {
  topic: string;
  prompts: string[];
  outline: ScriptOutline; // Use the specific type
  duration: number;
  memberCount: number;
  targetWordCount: {
    min: number;
    max: number;
    optimal: number;
  };
  enhancedQuality?: boolean; // Optional fields
  format?: any; // Optional fields
}

// A more specific type for OpenAI errors if available, otherwise use a basic structure
interface OpenAIErrorResponse {
  data?: any;
}

interface PotentialError {
  response?: OpenAIErrorResponse;
}

@Injectable()
export class ScriptService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(ScriptService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  // Helper function to handle OpenAI API calls
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
      if (error && typeof error === 'object' && 'response' in error) {
        const potentialError = error as PotentialError;
        if (potentialError.response?.data) {
          this.logger.error(
            'OpenAI Error Response Data:',
            potentialError.response.data,
          );
        }
      }
      throw new HttpException(
        `Failed to get ${description} from OpenAI`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateShortFormScript(dto: GenerateScriptDto): Promise<any> {
    const {
      topic,
      prompts = [], // Default to empty array if undefined
      outline = { format: {} }, // Default outline with format object
      duration,
      memberCount,
      targetWordCount,
    }: GenerateScriptDto = dto; // Add type annotation for destructuring

    this.logger.log(`Generating short-form script for topic: "${topic}"`);

    // Basic validation (more robust validation can be done with class-validator in DTO)
    if (!topic || !dto.outline || !duration) {
      // Check dto.outline directly
      throw new HttpException(
        'Missing required fields: topic, outline, duration',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Extract content from prompts safely
    const research = prompts[0]?.replace('Research Summary:\n', '') || '';
    const outlineText = prompts[1]?.replace('Podcast Outline:\n', '') || '';
    const hooks = prompts[2]?.replace('Engagement Elements:\n', '') || '';

    const model = 'gpt-4-turbo-preview';
    const temperature = 0.7;

    const systemMessage = `You are an expert podcast scriptwriter specialized in creating high-quality, engaging ${duration}-minute short-form podcast content. 
Your task is to write a structured podcast script that delivers expert insights on the given topic.

The script should be split into three distinct sections:
1. HOOK (15 seconds) - An attention-grabbing opening
2. INSIGHT (Main content - majority of time) - Core insights with evidence
3. TAKEAWAY (45 seconds) - Actionable conclusion

Use a conversational tone appropriate for ${memberCount} speaker(s).
Optimize for clarity, engagement, and professional delivery.
Include clear speaker labels (HOST, GUEST, etc.) and timing guidance.`;

    const prompt = `
TOPIC: ${topic}

RESEARCH:
${research}

OUTLINE:
${outlineText}

ENGAGEMENT ELEMENTS:
${hooks}

FORMAT REQUIREMENTS:
- Duration: ${duration} minutes total
- Structure: 15-second hook, main insight, 45-second takeaway
- Style: ${outline.format?.style || 'expert_insight'} 
- Tone: ${outline.format?.tone || 'authoritative'}
- Target word count: ${targetWordCount?.optimal || duration * 140} words
- Speaker format: ${memberCount} speaker(s)

QUALITY REQUIREMENTS:
- Content must be factually accurate and substantiated
- Include specific examples and evidence
- Use clear transitions between sections
- Make content actionable and relevant
- Optimize for spoken delivery (natural language)

Please create a structured script with three distinct sections that I can separate:
1. A compelling 15-second hook
2. The main insight section (core content)
3. A powerful 45-second takeaway/conclusion

Format with clear section breaks and speaker labels.`;

    // Generate script sections
    const hookContent = await this.callOpenAI(
      {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: `${prompt}\n\nPlease create ONLY the 15-second HOOK section of the script.`,
          },
        ],
        temperature: temperature,
        max_tokens: 250,
      },
      'hook section',
    );

    const insightContent = await this.callOpenAI(
      {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: `${prompt}\n\nPlease create ONLY the main INSIGHT section of the script.`,
          },
        ],
        temperature: temperature,
        max_tokens: 1500,
      },
      'insight section',
    );

    const takeawayContent = await this.callOpenAI(
      {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: `${prompt}\n\nPlease create ONLY the 45-second TAKEAWAY section of the script.`,
          },
        ],
        temperature: temperature,
        max_tokens: 500,
      },
      'takeaway section',
    );

    if (!hookContent || !insightContent || !takeawayContent) {
      throw new HttpException(
        'Failed to generate all script sections',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const fullScript = `${hookContent}\n\n${insightContent}\n\n${takeawayContent}`;
    const wordCount = fullScript.split(/\s+/).length;

    // Generate AI rating and feedback
    const ratingText = await this.callOpenAI(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert podcast script analyst who evaluates scripts based on content quality, structure, engagement, clarity, and pacing.',
          },
          {
            role: 'user',
            content: `Please evaluate this ${duration}-minute podcast script on a scale of 1-5 for each category, where 5 is excellent. Provide brief, actionable feedback.\n\nSCRIPT:\n${fullScript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      'AI rating',
    );

    if (!ratingText) {
      this.logger.warn(
        'Failed to generate AI rating, returning script without it.',
      );
      // Decide if you want to throw an error or return without rating
    }

    // Parse ratings (provide defaults if parsing fails or ratingText is null)
    const contentRating = parseFloat(
      ratingText?.match(/content.*?(\d+\.?\d*)/i)?.[1] || '0',
    );
    const structureRating = parseFloat(
      ratingText?.match(/structure.*?(\d+\.?\d*)/i)?.[1] || '0',
    );
    const engagementRating = parseFloat(
      ratingText?.match(/engagement.*?(\d+\.?\d*)/i)?.[1] || '0',
    );
    const clarityRating = parseFloat(
      ratingText?.match(/clarity.*?(\d+\.?\d*)/i)?.[1] || '0',
    );
    const pacingRating = parseFloat(
      ratingText?.match(/pacing.*?(\d+\.?\d*)/i)?.[1] || '0',
    );
    const overall =
      (contentRating +
        structureRating +
        engagementRating +
        clarityRating +
        pacingRating) /
      5;

    const improvements = ratingText?.includes('improvements')
      ? ratingText
          .split('improvements')[1]
          .split('\n')
          .filter((line) => line.trim().length > 0 && line.includes('-'))
          .map((line) => line.replace(/^-\s*/, '').trim())
      : [];

    this.logger.log(
      `Successfully generated short-form script for topic: "${topic}"`,
    );
    return {
      script: {
        hook: hookContent,
        insight: insightContent,
        takeaway: takeawayContent,
      },
      wordCount,
      metadata: {
        duration,
        type: 'expert_insight',
        sections: [
          { type: 'hook', duration: 15 },
          { type: 'insight', duration: duration * 60 - 60 },
          { type: 'takeaway', duration: 45 },
        ],
      },
      rating: {
        overall: parseFloat(overall.toFixed(1)) || 0,
        categories: {
          content: contentRating,
          structure: structureRating,
          engagement: engagementRating,
          clarity: clarityRating,
          pacing: pacingRating,
        },
        feedback: {
          strengths: [
            'Expert perspective',
            'Clear structure',
            'Engaging delivery',
            'Actionable takeaways',
            'Professional tone',
          ],
          improvements,
        },
      },
    };
  }
}
