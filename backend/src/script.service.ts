import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

// Import or redefine the GeneratedPrompts interface
interface GeneratedPrompts {
  researchPrompt: string;
  structurePrompt: string;
  introPrompt: string;
  segmentPrompts: string[];
  factCheckPrompt: string;
  conclusionPrompt: string;
}

// Define DTO again for clarity
export class GenerateScriptDto {
  prompts: GeneratedPrompts;
  memberCount?: number; // Make optional if only used for labeling
  topic?: string;
  duration?: number;
}

// Define OpenAI error interfaces - Removed as not currently used
// interface OpenAIErrorResponse {
//   data?: any;
// }

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
      throw new HttpException(
        `Failed to get ${description} from OpenAI`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Main script generation logic using structured prompts
  async generateShortFormScript(dto: GenerateScriptDto): Promise<any> {
    const { prompts, topic, duration }: GenerateScriptDto = dto;

    this.logger.log(
      `Generating script using structured prompts for topic: "${topic || 'Unknown'}"`,
    );

    // Validation for essential prompts
    if (
      !prompts ||
      !prompts.introPrompt ||
      !prompts.segmentPrompts ||
      !prompts.conclusionPrompt
    ) {
      throw new HttpException(
        'Missing required prompt fields in input',
        HttpStatus.BAD_REQUEST,
      );
    }

    const model = 'gpt-4-turbo-preview';
    const temperature = 0.7;
    const maxRetries = 2;

    // Helper for OpenAI calls with retry
    const callOpenAIWithRetry = async (
      options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      description: string,
    ): Promise<string | null> => {
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          return await this.callOpenAI(options, description);
        } catch (error: unknown) {
          attempt++;
          this.logger.warn(
            `Attempt ${attempt} failed for ${description}. Retrying...`,
          );
          if (attempt > maxRetries) {
            this.logger.error(
              `Max retries reached for ${description}. Failing.`,
            );
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
      return null;
    };

    // --- Generate Script Sections ---
    this.logger.log('Generating Introduction...');
    const introContent = await callOpenAIWithRetry(
      {
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a podcast scriptwriter creating an engaging introduction.',
          },
          { role: 'user', content: prompts.introPrompt },
        ],
        temperature,
        max_tokens: 500,
      },
      'introduction section',
    );

    this.logger.log('Generating Segments...');
    const segmentContents: string[] = [];
    let previousSegmentContent = introContent || '';
    for (let i = 0; i < prompts.segmentPrompts.length; i++) {
      this.logger.log(`Generating Segment ${i + 1}...`);
      const segmentPrompt = prompts.segmentPrompts[i];
      const segmentContent = await callOpenAIWithRetry(
        {
          model,
          messages: [
            {
              role: 'system',
              content: `You are a podcast scriptwriter writing segment ${
                i + 1
              }. Maintain context and flow.`,
            },
            {
              role: 'user',
              content: `Previous Context:\n${previousSegmentContent.slice(
                -500,
              )}...\n\n---\n\nPrompt:\n${segmentPrompt}`,
            },
          ],
          temperature,
          max_tokens: 1000,
        },
        `segment ${i + 1}`,
      );
      if (segmentContent) {
        segmentContents.push(segmentContent);
        previousSegmentContent = segmentContent;
      } else {
        this.logger.error(
          `Failed to generate content for segment ${i + 1} after retries.`,
        );
        segmentContents.push(`[ERROR: FAILED TO GENERATE SEGMENT ${i + 1}]`);
      }
    }

    this.logger.log('Generating Conclusion...');
    const conclusionContent = await callOpenAIWithRetry(
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a podcast scriptwriter writing the conclusion.',
          },
          {
            role: 'user',
            content: `Previous Context:\n${previousSegmentContent.slice(
              -500,
            )}...\n\n---\n\nPrompt:\n${prompts.conclusionPrompt}`,
          },
        ],
        temperature,
        max_tokens: 500,
      },
      'conclusion section',
    );

    // Check generation success
    if (
      !introContent ||
      segmentContents.some((s) => s.startsWith('[ERROR')) ||
      !conclusionContent
    ) {
      this.logger.error(
        'Failed to generate one or more essential script sections.',
      );
      throw new HttpException(
        'Failed to generate complete script using provided prompts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // --- Combine Sections ---
    const combinedSegments = segmentContents.join('\n\n---\n\n');
    const fullScript = `${introContent}\n\n---\n\n${combinedSegments}\n\n---\n\n${conclusionContent}`;
    const wordCount = fullScript.split(/\s+/).filter(Boolean).length;
    this.logger.log(`Generated script with ${wordCount} words.`);

    // --- AI Rating ---
    this.logger.log('Generating AI Rating...');
    const ratingText = await callOpenAIWithRetry(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert script analyst. Rate on content, structure, engagement, clarity, pacing (1-5). Provide strengths/improvements.',
          },
          {
            role: 'user',
            content: `Evaluate this script (~${duration || 'N/A'
              } min, topic: "${topic || 'Unknown'
              }").\n\nSCRIPT:\n${fullScript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      'AI rating',
    );

    // --- Parse Rating ---
    let parsedRating: any = {
      overall: 0,
      categories: {},
      feedback: { strengths: [], improvements: [] },
    };
    if (ratingText) {
      try {
        const jsonMatch = ratingText.match(/```json\n?(\{.*?\})\n?```/s);
        if (jsonMatch && jsonMatch[1]) {
          parsedRating = JSON.parse(jsonMatch[1]);
        } else {
          const extractRating = (key: string) =>
            parseFloat(
              ratingText.match(
                // Corrected Regex: Use non-capturing group, no unnecessary escapes
                new RegExp(`${key}.*?(\d+(?:\.\d*)?)`, 'i'), 
              )?.[1] || '0',
            );
          const content = extractRating('content');
          const structure = extractRating('structure');
          const engagement = extractRating('engagement');
          const clarity = extractRating('clarity');
          const pacing = extractRating('pacing');
          const overall = (content + structure + engagement + clarity + pacing) / 5;

          const extractFeedback = (key: string): string[] =>
            ratingText.toLowerCase().includes(key)
              ? ratingText
                  .split(new RegExp(key, 'i'))[1]
                  ?.split('\n')
                  .map((line) => line.replace(/^[-*]\s*/, '').trim())
                  .filter((line) => line.length > 5)
              : [];

          parsedRating = {
            overall: parseFloat(overall.toFixed(1)) || 0,
            categories: { content, structure, engagement, clarity, pacing },
            feedback: {
              strengths: extractFeedback('strengths'),
              improvements: extractFeedback('improvements'),
            },
          };
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI rating text:', parseError);
      }
    }

    this.logger.log(
      `Successfully generated and rated script for topic: "${topic || 'Unknown'}"`,
    );

    // --- Return Result ---
    return {
      script: {
        introduction: introContent,
        segments: segmentContents,
        conclusion: conclusionContent,
      },
      fullScript: fullScript,
      wordCount,
      rating: parsedRating,
    };
  }
}
