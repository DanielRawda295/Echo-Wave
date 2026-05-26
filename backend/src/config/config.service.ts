// src/config/config.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * ConfigService
 * Wraps NestJS ConfigService to provide typed access to environment variables.
 * Includes helper methods for numbers and environment checks.
 */
@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  /**
   * Get environment variable as string
   * @param key - Name of the environment variable
   * @returns string value
   */
  get(key: string): string {
    return this.config.get<string>(key)!;
  }

  /**
   * Get environment variable as number
   * @param key - Name of the environment variable
   * @returns number value
   */
  getNumber(key: string): number {
    return parseInt(this.get(key), 10);
  }

  /**
   * Check if the application is running in production
   */
  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }
}
