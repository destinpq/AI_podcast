import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScriptService, GenerateScriptDto } from './script.service';

@Controller('script')
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) {}

  @Post('generate/short-form')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async generateShortFormScript(
    @Body() generateScriptDto: GenerateScriptDto,
  ): Promise<any> {
    return this.scriptService.generateShortFormScript(generateScriptDto);
  }
}
