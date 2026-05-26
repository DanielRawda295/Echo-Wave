// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

/**
 * DatabaseModule
 * Configures TypeORM with PostgreSQL using async configuration
 * from the custom ConfigService.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      inject: [ConfigService], // Inject custom ConfigService
      useFactory: (config: ConfigService) => ({
        type: 'postgres', // Database type
        host: config.get('DB_HOST'), // Database host
        port: config.getNumber('DB_PORT'), // Database port
        username: config.get('DB_USER'), // Database username
        password: config.get('DB_PASS'), // Database password
        database: config.get('DB_NAME'), // Database name
        entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'], // Load entities dynamically
        synchronize: true, // Auto sync schema (disable in production)
      }),
    }),
  ],
})
export class DatabaseModule {}
