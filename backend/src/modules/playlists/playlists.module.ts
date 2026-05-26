import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { Track } from '../tracks/entities/track.entity';
import { PlaylistsResolver } from './playlists.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, Track])],
  providers: [PlaylistsService, PlaylistsResolver],
  controllers: [PlaylistsController],
})
export class PlaylistsModule {}
