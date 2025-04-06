import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

class GeneratePromptsDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  memberCount: number;

  @IsString()
  @IsNotEmpty()
  style: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsString()
  @IsOptional()
  requirements: string;
}

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post('generate')
  async generatePrompts(@Body() generatePromptsDto: GeneratePromptsDto) {
    try {
      const result = await this.promptsService.generatePrompts(generatePromptsDto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate prompts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 