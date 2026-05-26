import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';
import { TrackLike } from './entities/track-like.entity';
import { TrackComment } from './entities/track-comment.entity';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { TracksResolver } from './tracks.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Track, TrackLike, TrackComment])],
  providers: [TracksService, TracksResolver],
  controllers: [TracksController],
})
export class TracksModule {}
