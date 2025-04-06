import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OutlineService, GenerateOutlineDto } from './outline.service';

@Controller('outline')
export class OutlineController {
  constructor(private readonly outlineService: OutlineService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async generateOutline(
    @Body() generateOutlineDto: GenerateOutlineDto,
  ): Promise<any> {
    return this.outlineService.generateOutline(generateOutlineDto);
  }
}
