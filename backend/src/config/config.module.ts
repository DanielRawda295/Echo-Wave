// src/config/config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

/**
 * ConfigModule
 * Wraps NestJS ConfigModule and provides a custom ConfigService.
 * Makes configuration globally available.
 */
@Module({
  imports: [NestConfigModule.forRoot({ isGlobal: true })],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
