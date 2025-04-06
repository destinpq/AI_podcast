import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';

@Module({
  imports: [ConfigModule],
  providers: [PromptsService],
  controllers: [PromptsController],
})
export class PromptsModule {} 