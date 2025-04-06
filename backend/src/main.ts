import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = 7778; // Explicitly using port 7778 for backend
  const clientUrl =
    configService.get<string>('CLIENT_URL') || 'http://localhost:7777'; // Update default client URL to 7777

  // Enable CORS
  app.enableCors({
    origin: [
      clientUrl,
      'https://ai-podcast-git-main-pratikk94s-projects.vercel.app',
    ], // Allow your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(port);
  Logger.log(`🚀 Backend application is running on: http://localhost:${port}`);
  Logger.log(`🔌 Allowing connections from: ${clientUrl}`);
}
bootstrap();
