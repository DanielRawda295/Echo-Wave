import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TracksService } from './tracks.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { TrackCommentGql, TrackGql, TrackLikeInfoGql } from './graphql/track.gql';

function toUserPublic(user: any) {
  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar ?? null,
    role: user.role,
    createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
  };
}

function toTrackGql(track: any): TrackGql {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    fileUrl: track.fileUrl,
    coverUrl: track.coverUrl,
    playCount: track.playCount ?? 0,
    createdAt: track.createdAt ? new Date(track.createdAt) : undefined,
    uploader: track.uploader ? toUserPublic(track.uploader) : undefined,
  };
}

function toCommentGql(row: any): TrackCommentGql {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    user: row.user ? toUserPublic(row.user) : undefined,
  };
}

@Resolver(() => TrackGql)
export class TracksResolver {
  constructor(private readonly tracks: TracksService) {}

  @Query(() => [TrackGql])
  async communityTracks() {
    const rows = await this.tracks.findAll();
    return (rows || []).map(toTrackGql);
  }

  @Query(() => TrackGql, { nullable: true })
  async track(@Args('id', { type: () => Int }) id: number) {
    const row = await this.tracks.findById(id);
    if (!row) return null;
    return toTrackGql(row);
  }

  @Query(() => [TrackGql])
  async searchCommunityTracks(@Args('term') term: string) {
    const rows = await this.tracks.search(term);
    return (rows || []).map(toTrackGql);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [TrackGql])
  async myTracks(@Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const rows = await this.tracks.findMine(userId);
    return (rows || []).map(toTrackGql);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TrackLikeInfoGql)
  async trackLikeInfo(@Args('trackId', { type: () => Int }) trackId: number, @Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const [likeCount, liked] = await Promise.all([
      this.tracks.getLikeCount(trackId),
      this.tracks.isLikedBy(trackId, userId),
    ]);
    return { trackId, likeCount, liked };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TrackLikeInfoGql)
  async toggleTrackLike(@Args('trackId', { type: () => Int }) trackId: number, @Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    return this.tracks.toggleLike(trackId, userId);
  }

  @Query(() => [TrackCommentGql])
  async trackComments(@Args('trackId', { type: () => Int }) trackId: number) {
    const rows = await this.tracks.listComments(trackId);
    return (rows || []).map(toCommentGql);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TrackCommentGql)
  async addTrackComment(
    @Args('trackId', { type: () => Int }) trackId: number,
    @Args('text') text: string,
    @Context() ctx: any
  ) {
    const userId = Number(ctx?.req?.user?.sub);
    const row = await this.tracks.addComment(trackId, userId, { text } as any);
    return toCommentGql(row);
  }
}
