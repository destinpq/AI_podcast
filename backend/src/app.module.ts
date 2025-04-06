import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScriptModule } from './script/script.module';
import { OutlineModule } from './outline/outline.module';
import { PromptsModule } from './prompts/prompts.module';
import { NewsModule } from './news/news.module';
import { FactsModule } from './facts/facts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScriptModule,
    OutlineModule,
    PromptsModule,
    NewsModule,
    FactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
