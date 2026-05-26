// src/database/data-source.ts

import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Track } from '../modules/tracks/entities/track.entity';
import { Playlist } from '../modules/playlists/entities/playlist.entity';

/**
 * TypeORM DataSource configuration
 * Defines the database connection and loaded entities for migrations and queries
 */
export default new DataSource({
  type: 'postgres', // Database type
  host: process.env.DB_HOST, // Database host from environment
  port: parseInt(process.env.DB_PORT || '5432'), // Database port with fallback
  username: process.env.DB_USER, // Database username
  password: process.env.DB_PASS, // Database password
  database: process.env.DB_NAME, // Database name
  entities: [User, Track, Playlist], // Registered entities
  synchronize: false, // Do not auto-sync schema in production
  migrations: ['src/database/migrations/*.ts'], // Path to migration files
});
