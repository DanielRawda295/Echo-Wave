import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { SongCard } from '../components';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { playPause, setActiveSong } from '../redux/features/playerSlice';
import { useToasts } from '../hooks/useToasts';

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

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const toast = useToasts((s) => s.push);
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rename, setRename] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [reordering, setReordering] = useState(false);

  const songs = useMemo(() => {
    const items = playlist?.items || [];
    return items.map((it) => ({
      key: it.externalId,
      title: it.title,
      subtitle: it.artist,
      images: { coverart: it.artwork },
      previewUrl: it.previewUrl,
      _playlistExternalId: it.externalId,
    }));
  }, [playlist]);

  async function refresh() {
    const res = await api.get(`/playlists/${playlistId}`);
    const pl = res.data as Playlist | null;
    setPlaylist(pl);
    setRename(pl?.name || '');
  }

  useEffect(() => {
    let active = true;
    async function load() {
      if (!playlistId || Number.isNaN(playlistId)) {
        setError('Invalid playlist id');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        await refresh();
      } catch (err: any) {
        if (!active) return;
        const msg =
          err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load playlist';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  async function saveName() {
    const next = rename.trim();
    if (!next || !playlist) return;
    setSavingName(true);
    try {
      const res = await api.patch(`/playlists/${playlist.id}`, { name: next });
      setPlaylist(res.data);
      toast('Playlist renamed', 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to rename playlist';
      toast(String(msg), 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function removeItem(externalId: string) {
    if (!playlist) return;
    try {
      const res = await api.delete(`/playlists/${playlist.id}/items/${encodeURIComponent(externalId)}`);
      setPlaylist(res.data);
      toast('Removed from playlist', 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to remove item';
      toast(String(msg), 'error');
    }
  }

  async function deletePlaylist() {
    if (!playlist) return;
    const ok = window.confirm(`Delete playlist "${playlist.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/playlists/${playlist.id}`);
      toast('Playlist deleted', 'success');
      window.location.href = '/playlists';
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete playlist';
      toast(String(msg), 'error');
    }
  }

  async function moveItem(externalId: string, dir: -1 | 1) {
    if (!playlist) return;
    const items = [...(playlist.items || [])];
    const index = items.findIndex((it) => it.externalId === externalId);
    if (index < 0) return;
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const tmp = items[index];
    items[index] = items[nextIndex];
    items[nextIndex] = tmp;

    setPlaylist({ ...playlist, items });
    setReordering(true);
    try {
      const res = await api.patch(`/playlists/${playlist.id}/items/reorder`, {
        externalIds: items.map((it) => it.externalId),
      });
      setPlaylist(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reorder playlist';
      toast(String(msg), 'error');
      await refresh();
    } finally {
      setReordering(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Playlist link copied', 'success');
    } catch {
      toast('Could not copy link', 'error');
    }
  }

  if (loading) return <div className="text-white/80">Loading playlist…</div>;

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-lg font-semibold">Could not load playlist</div>
        <div className="mt-2 text-sm text-white/80">{error}</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
        Playlist not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10 gap-4">
        <div className="min-w-0">
          <h2 className="font-bold text-3xl text-white text-left truncate">{playlist.name}</h2>
          <p className="text-sm text-white/70 mt-1">{songs.length} songs</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
            disabled={!songs.length}
            onClick={() => {
              if (!songs.length) return;
              dispatch(setActiveSong({ song: songs[0], data: songs, i: 0 }));
              dispatch(playPause(true));
            }}
          >
            Play all
          </button>
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
            disabled={!songs.length}
            onClick={() => {
              if (!songs.length) return;
              const shuffled = [...songs].sort(() => Math.random() - 0.5);
              dispatch(setActiveSong({ song: shuffled[0], data: shuffled, i: 0 }));
              dispatch(playPause(true));
            }}
          >
            Shuffle play
          </button>
          <button
            type="button"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            onClick={copyLink}
          >
            Copy link
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-600/90 px-4 py-2 text-sm text-white hover:bg-red-600"
            onClick={deletePlaylist}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-white font-semibold">Rename playlist</div>
        <div className="mt-3 flex gap-3 sm:flex-row flex-col">
          <input
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            className="h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            placeholder="Playlist name"
          />
          <button
            type="button"
            onClick={saveName}
            disabled={savingName || rename.trim().length < 2}
            className="h-11 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {savingName ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {!songs.length ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
            No songs yet. Use the “+” button on any song card to add it to this playlist.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {songs.map((song: any, i: number) => (
              <div key={song.key || `${i}`} className="relative w-full sm:max-w-[280px]">
                <SongCard
                  song={song}
                  isPlaying={isPlaying}
                  activeSong={activeSong}
                  data={songs}
                  i={i}
                />
                <div className="absolute left-2 top-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70 disabled:opacity-50"
                    disabled={reordering || i === 0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveItem(song._playlistExternalId, -1);
                    }}
                    aria-label="Move up"
                    title="Move up"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70 disabled:opacity-50"
                    disabled={reordering || i === songs.length - 1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveItem(song._playlistExternalId, 1);
                    }}
                    aria-label="Move down"
                    title="Move down"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(song._playlistExternalId);
                    }}
                    aria-label="Remove from playlist"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
