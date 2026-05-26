// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Bootstrap the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe to automatically validate DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Global exception filter for structured error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS for all origins with credentials
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Ensure uploads folders exist and serve them statically
  const uploadsRoot = join(process.cwd(), 'uploads');
  const audioDir = join(uploadsRoot, 'audio');
  const imagesDir = join(uploadsRoot, 'images');
  if (!existsSync(audioDir)) mkdirSync(audioDir, { recursive: true });
  if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });
  (app as any).useStaticAssets(uploadsRoot, { prefix: '/uploads' });

  // Start server on port 3000
  await app.listen(3000);
}

bootstrap();
