import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { FactsService } from './facts.service';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

class GenerateFactsDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsNumber()
  @IsOptional()
  count?: number;
}

@Controller('facts')
export class FactsController {
  constructor(private readonly factsService: FactsService) {}

  @Post('generate')
  async generateFacts(@Body() generateFactsDto: GenerateFactsDto) {
    try {
      const result = await this.factsService.generateFacts(
        generateFactsDto.topic,
        generateFactsDto.count,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate facts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 