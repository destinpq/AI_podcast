import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScriptService } from '../script.service';
import { ScriptController } from '../script.controller';

@Module({
  imports: [ConfigModule],
  providers: [ScriptService],
  controllers: [ScriptController],
})
export class ScriptModule {}
