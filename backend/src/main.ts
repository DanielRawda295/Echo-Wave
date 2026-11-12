// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Bootstrap the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

  // Global validation pipe to automatically validate DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Global exception filter for structured error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')
  ).split(',').map((origin) => origin.trim()).filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
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

  // Hosting providers supply PORT; retain the local development default.
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

bootstrap();
