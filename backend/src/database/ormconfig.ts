// src/database/data-source.ts

import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database-options';

/**
 * TypeORM DataSource configuration
 * Defines the database connection and loaded entities for migrations and queries
 */
export default new DataSource({
  ...createDatabaseOptions(process.env),
  synchronize: false,
});
