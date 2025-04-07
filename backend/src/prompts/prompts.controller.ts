import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

class GeneratePromptsDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  mood: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;
}

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post('generate')
  async generatePrompts(@Body() generatePromptsDto: GeneratePromptsDto) {
    try {
      const result = await this.promptsService.generatePrompts(
        generatePromptsDto as any,
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to generate prompts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 