import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { GeneratePromptsDto } from './prompts.types';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post('generate')
  async generatePrompts(@Body() generatePromptsDto: GeneratePromptsDto) {
    try {
      const result = await this.promptsService.generatePrompts(generatePromptsDto);
      return result;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to generate prompts';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 