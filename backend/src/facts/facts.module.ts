import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FactsService } from './facts.service';
import { FactsController } from './facts.controller';

@Module({
  imports: [ConfigModule],
  providers: [FactsService],
  controllers: [FactsController],
})
export class FactsModule {} 