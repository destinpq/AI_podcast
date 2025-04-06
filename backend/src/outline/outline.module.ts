import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutlineService } from '../outline.service';
import { OutlineController } from '../outline.controller';

@Module({
  imports: [ConfigModule],
  providers: [OutlineService],
  controllers: [OutlineController],
})
export class OutlineModule {}
