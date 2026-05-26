import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { SongCard } from '../components';
import type { RootState } from '../redux/store';
import { playPause, setActiveSong } from '../redux/features/playerSlice';

type PlaylistItem = {
  externalId: string;
  title?: string;
  artist?: string;
  artwork?: string;
  previewUrl?: string;
  addedAt: string;
};

type Playlist = {
  id: number;
  name: string;
  items: PlaylistItem[];
};

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  const playlistSongsById = useMemo(() => {
    const map = new Map<number, any[]>();
    playlists.forEach((pl) => {
      const songs = (pl.items || []).map((it) => ({
        key: it.externalId,
        title: it.title,
        subtitle: it.artist,
        images: { coverart: it.artwork },
        previewUrl: it.previewUrl,
        _playlistExternalId: it.externalId,
      }));
      map.set(pl.id, songs);
    });
    return map;
  }, [playlists]);

  async function refresh() {
    setError('');
    const res = await api.get('/playlists/me');
    setPlaylists(res.data || []);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        await refresh();
      } catch (err: any) {
        if (!active) return;
        const msg =
          err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load playlists';
        setError(String(msg));
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function createPlaylist() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/playlists', { name });
      setNewName('');
      await refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create playlist';
      setError(String(msg));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="text-white/80">Loading playlists…</div>;

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">Playlists</h2>
          <p className="text-sm text-white/70 mt-1">Create playlists and add any song you like.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-white font-semibold">Create playlist</div>
        <div className="mt-3 flex gap-3 sm:flex-row flex-col">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Playlist name"
            className="h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={createPlaylist}
            disabled={creating || newName.trim().length < 2}
            className="h-11 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {playlists.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
            No playlists yet. Create one above, then use the “+” button on any song card to add it.
          </div>
        ) : (
          playlists.map((pl) => (
            <div key={pl.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-white">{pl.name}</div>
                  <div className="text-sm text-white/70">{pl.items?.length || 0} songs</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/playlists/${pl.id}`}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
                    disabled={(playlistSongsById.get(pl.id) || []).length === 0}
                    onClick={() => {
                      const songs = playlistSongsById.get(pl.id) || [];
                      if (!songs.length) return;
                      dispatch(setActiveSong({ song: songs[0], data: songs, i: 0 }));
                      dispatch(playPause(true));
                      setExpanded((prev) => ({ ...prev, [pl.id]: true }));
                    }}
                  >
                    Play all
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                    onClick={() => setExpanded((prev) => ({ ...prev, [pl.id]: !prev[pl.id] }))}
                  >
                    {expanded[pl.id] ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>

              {!pl.items?.length ? (
                <div className="mt-4 text-sm text-white/70">No songs yet.</div>
              ) : expanded[pl.id] ? (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
                  {(playlistSongsById.get(pl.id) || []).map((song: any, i: number) => (
                    <SongCard
                      key={song.key || song.trackId || `${pl.id}_${i}`}
                      song={song}
                      isPlaying={isPlaying}
                      activeSong={activeSong}
                      data={playlistSongsById.get(pl.id) || []}
                      i={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-white/70">
                  Tap <span className="text-white">View</span> to see and play songs in this playlist.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
