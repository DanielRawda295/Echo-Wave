import { PlaylistsService } from './playlists.service';
import { PlaylistsResolver } from './playlists.resolver';
import { TracksService } from '../tracks/tracks.service';
import { TracksResolver } from '../tracks/tracks.resolver';
import type { Repository } from 'typeorm';
import type { Playlist } from './entities/playlist.entity';
import type { Track } from '../tracks/entities/track.entity';

describe('Shared REST/GraphQL validation', () => {
  const ctx = { req: { user: { sub: 1 } } };
  it('rejects invalid playlist names through the GraphQL resolver before persistence', async () => {
    const save = jest.fn();
    const repo = {
      create: (value: unknown) => value,
      save,
    } as unknown as Repository<Playlist>;
    const resolver = new PlaylistsResolver(
      new PlaylistsService(repo, {} as Repository<Track>),
    );
    await expect(resolver.createPlaylist('X'.repeat(81), ctx)).rejects.toThrow(
      '1 to 80',
    );
    await expect(resolver.createPlaylist('   ', ctx)).rejects.toThrow(
      '1 to 80',
    );
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects oversized and blank comments through GraphQL before persistence', async () => {
    const service = new TracksService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const resolver = new TracksResolver(service);
    await expect(
      resolver.addTrackComment(1, 'X'.repeat(501), ctx),
    ).rejects.toThrow('1 to 500');
    await expect(resolver.addTrackComment(1, '   ', ctx)).rejects.toThrow(
      '1 to 500',
    );
  });

  it('rejects unsafe media URLs through the shared playlist item service', async () => {
    const service = new PlaylistsService({} as never, {} as never);
    await expect(
      service.addItem(1, 1, {
        externalId: 'song',
        artwork: 'javascript:alert(1)',
      }),
    ).rejects.toThrow('Invalid playlist details');
  });
});
