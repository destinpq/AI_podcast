import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  GeneratedPrompts,
  GeneratePromptsDto as PromptGenerationParams,
} from './prompts.types';

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

      1.  **Research Focus**: A prompt instructing the AI to conduct deep research, find stunning facts, relevant statistics, historical context, recent developments, potential controversies, and **verifiable sources/citations** related to the topic "${topic}". The research should support the specified mood: "${mood}".
      2.  **Overall Structure**: A prompt defining a high-level outline or structure for the ${duration}-minute podcast. Consider the mood "${mood}" and topic "${topic}" when suggesting segments (e.g., intro, deep dive 1, emotional anecdote, expert insight, factual segment, conclusion).
      3.  **Introduction**: A prompt to write an engaging introduction (approx. 1-2 minutes) that grabs the listener, introduces the topic "${topic}", sets the mood "${mood}", and hints at the depth and variety of content to come.
      4.  **Segment Prompts (Array)**: Generate an array of prompts, one for each main segment identified in the structure. Each prompt should instruct the AI to write that specific segment's script (e.g., 3-5 minutes each), incorporating:
          *   The research findings **including specific facts and figures**.
          *   Specific emotional tones fitting the overall mood "${mood}".
          *   **Crucially, instruct the AI writing the segment to internally note or mark where specific facts/figures requiring citations are used.**
          *   Potentially different formats within segments.
      5.  **Fact Check & Citation Prompt**: A prompt instructing a **separate** AI instance to:
          *   Review a completed script based on the topic "${topic}".
          *   Identify key factual claims, statistics, dates, or data points presented.
          *   For each identified claim, attempt to find a verifiable source (e.g., URL to a reputable publication, study DOI, book reference).
          *   **Format the output as a structured list (e.g., JSON array of objects, or markdown list) mapping each claim to its source.** If a source cannot be found for a claim, indicate that explicitly (e.g., "Source not found").
      6.  **Conclusion**: A prompt to write a memorable conclusion (approx. 1-2 minutes) that summarizes key takeaways, reinforces the mood "${mood}", and provides a satisfying closing thought or call to action related to "${topic}".

      Ensure the generated prompts are clear, specific, and actionable. The final output MUST be a valid JSON object containing keys like "researchPrompt", "structurePrompt", "introPrompt", "segmentPrompts" (an array of strings), "factCheckPrompt", and "conclusionPrompt".
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
        response_format: { type: 'json_object' },
      });

      const jsonResponse = response.choices[0].message.content;

      if (!jsonResponse) {
        throw new Error('OpenAI returned an empty response.');
      }

      try {
        const parsedPrompts = JSON.parse(jsonResponse) as GeneratedPrompts;
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
        return parsedPrompts;
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