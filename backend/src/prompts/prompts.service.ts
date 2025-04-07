import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface PromptGenerationParams {
  topic: string;
  mood: string;
  duration: number;
}

// Define the expected structure of the JSON response
interface GeneratedPrompts {
  researchPrompt: string;
  structurePrompt: string;
  introPrompt: string;
  segmentPrompts: string[];
  factCheckPrompt: string;
  conclusionPrompt: string;
}

@Injectable()
export class PromptsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generatePrompts(
    params: PromptGenerationParams,
  ): Promise<GeneratedPrompts> {
    const { topic, mood, duration } = params;

    if (!topic || !mood || !duration) {
      throw new Error('Missing required parameters: topic, mood, and duration');
    }

    const metaPrompt = `
      You are a master podcast producer and creative director.
      Your task is to generate a detailed set of prompts for another AI (like yourself) to write a compelling podcast script.
      The podcast topic is: "${topic}"
      The desired mood is: "${mood}"
      The target duration is approximately ${duration} minutes.

      Generate a JSON object containing specific prompts for the following podcast elements:

      1.  **Research Focus**: A prompt instructing the AI to conduct deep research, find stunning facts, relevant statistics, historical context, recent developments, and potential controversies related to the topic "${topic}". The research should support the specified mood: "${mood}".
      2.  **Overall Structure**: A prompt defining a high-level outline or structure for the ${duration}-minute podcast. Consider the mood "${mood}" and topic "${topic}" when suggesting segments (e.g., intro, deep dive 1, emotional anecdote, expert insight, factual segment, listener question simulation, conclusion).
      3.  **Introduction**: A prompt to write an engaging introduction (approx. 1-2 minutes) that grabs the listener, introduces the topic "${topic}", sets the mood "${mood}", and hints at the depth and variety of content to come.
      4.  **Segment Prompts (Array)**: Generate an array of prompts, one for each main segment identified in the structure. Each prompt should instruct the AI to write that specific segment's script (e.g., 3-5 minutes each), incorporating:
          *   The research findings.
          *   Specific emotional tones fitting the overall mood "${mood}" (e.g., create a segment that evokes curiosity, another that is humorous, one that is serious and factual, one that is reflective or poignant). Ensure a mix of emotions is covered throughout the podcast.
          *   Stunning facts or insightful statistics found during research.
          *   Potentially different formats within segments (e.g., monologue, simulated dialogue, storytelling).
      5.  **Fact Check/Verification**: A prompt instructing the AI to review the generated script segments, identify key factual claims, and suggest verification checks or sources.
      6.  **Conclusion**: A prompt to write a memorable conclusion (approx. 1-2 minutes) that summarizes key takeaways, reinforces the mood "${mood}", and provides a satisfying closing thought or call to action related to "${topic}".

      Ensure the generated prompts are clear, specific, and actionable for an AI scriptwriter. The final output MUST be a valid JSON object containing keys like "researchPrompt", "structurePrompt", "introPrompt", "segmentPrompts" (an array of strings), "factCheckPrompt", and "conclusionPrompt".
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system' as const,
            content:
              'You are a helpful assistant designed to generate structured prompts in JSON format based on user requirements.',
          },
          {
            role: 'user' as const,
            content: metaPrompt,
          },
        ],
        response_format: { type: 'json_object' }, // Request JSON output
      });

      const jsonResponse = response.choices[0].message.content;

      if (!jsonResponse) {
        throw new Error('OpenAI returned an empty response.');
      }

      // Attempt to parse the JSON response
      try {
        const parsedPrompts = JSON.parse(jsonResponse) as GeneratedPrompts; // Assert type
        // Basic validation (can be expanded)
        if (
          !parsedPrompts.researchPrompt ||
          !parsedPrompts.structurePrompt ||
          !Array.isArray(parsedPrompts.segmentPrompts) ||
          !parsedPrompts.introPrompt ||
          !parsedPrompts.factCheckPrompt ||
          !parsedPrompts.conclusionPrompt
        ) {
          throw new Error('Generated JSON is missing required prompt fields.');
        }
        return parsedPrompts; // Return the parsed JSON object
      } catch (parseError) {
        console.error('Failed to parse OpenAI JSON response:', jsonResponse);
        const message =
          parseError instanceof Error
            ? parseError.message
            : 'Unknown parsing error';
        throw new Error(`Failed to parse generated prompts JSON: ${message}`);
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown OpenAI error';
      throw new Error(`Failed to generate prompts via OpenAI: ${message}`);
    }
  }
} 