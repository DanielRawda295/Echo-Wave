import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { PlaylistsService } from './playlists.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PlaylistGql, PlaylistItemInput, SuccessGql } from './graphql/playlist.gql';

function toPlaylistGql(playlist: any): PlaylistGql {
  return {
    id: playlist.id,
    name: playlist.name,
    items: (playlist.items || []).map((it: any) => ({
      externalId: it.externalId,
      title: it.title,
      artist: it.artist,
      artwork: it.artwork,
      previewUrl: it.previewUrl,
      addedAt: it.addedAt ? new Date(it.addedAt) : undefined,
    })),
  };
}

@Resolver(() => PlaylistGql)
export class PlaylistsResolver {
  constructor(private readonly playlists: PlaylistsService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [PlaylistGql])
  async myPlaylists(@Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const rows = await this.playlists.findMine(userId);
    return rows.map(toPlaylistGql);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => PlaylistGql, { nullable: true })
  async playlist(@Args('id', { type: () => Int }) id: number, @Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.findById(id);
    if (!pl) return null;
    if (Number((pl.creator as any)?.id) !== userId) return null;
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PlaylistGql)
  async createPlaylist(@Args('name') name: string, @Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.create({ name, items: [] } as any, userId);
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PlaylistGql)
  async renamePlaylist(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
    @Context() ctx: any
  ) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.rename(id, userId, name);
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PlaylistGql)
  async addPlaylistItem(
    @Args('playlistId', { type: () => Int }) playlistId: number,
    @Args('item') item: PlaylistItemInput,
    @Context() ctx: any
  ) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.addItem(playlistId, userId, item as any);
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PlaylistGql)
  async removePlaylistItem(
    @Args('playlistId', { type: () => Int }) playlistId: number,
    @Args('externalId') externalId: string,
    @Context() ctx: any
  ) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.removeItem(playlistId, userId, externalId);
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PlaylistGql)
  async reorderPlaylistItems(
    @Args('playlistId', { type: () => Int }) playlistId: number,
    @Args({ name: 'externalIds', type: () => [String] }) externalIds: string[],
    @Context() ctx: any
  ) {
    const userId = Number(ctx?.req?.user?.sub);
    const pl = await this.playlists.reorderItems(playlistId, userId, { externalIds } as any);
    return toPlaylistGql(pl);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SuccessGql)
  async deletePlaylist(@Args('id', { type: () => Int }) id: number, @Context() ctx: any) {
    const userId = Number(ctx?.req?.user?.sub);
    const res = await this.playlists.deletePlaylist(id, userId);
    return { success: !!res?.success };
  }
}

