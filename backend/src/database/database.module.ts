// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { createDatabaseOptions } from './database-options';

/**
 * DatabaseModule
 * Configures TypeORM with PostgreSQL using async configuration
 * from the custom ConfigService.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: () => createDatabaseOptions(process.env),
    }),
  ],
})
export class DatabaseModule {}
