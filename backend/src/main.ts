import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get configuration
  const port = configService.get<number>('PORT') || 7779; // Get PORT from env or use 7779 as fallback
  const clientUrl =
    configService.get<string>('CLIENT_URL') || 'https://king-prawn-app-npvka.ondigitalocean.app'; // Update default client URL
  
  // Enable CORS
  app.enableCors({
    origin: clientUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Accepting requests from: ${clientUrl}`);
}
bootstrap();
