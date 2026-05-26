// src/app.module.ts

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { ExternalModule } from './modules/external/external.module';
import { ChatModule } from './modules/chat/chat.module';

/**
 * Root application module that imports all feature modules.
 */
@Module({
  imports: [
    ConfigModule,        // Global configuration
    DatabaseModule,      // TypeORM database connection
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      useGlobalPrefix: true,
      path: 'graphql',
      context: ({ req, res }) => ({ req, res }),
    }),
    AuthModule,          // Authentication module
    UsersModule,         // Users management module
    TracksModule,        // Tracks management module
    PlaylistsModule,     // Playlists management module
    ExternalModule,      // External API integration module
    ChatModule,          // Local chatbot (Ollama) module
  ],
})
export class AppModule {}
