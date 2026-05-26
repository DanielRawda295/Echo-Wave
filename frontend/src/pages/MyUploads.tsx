import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { SongCard } from '../components';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getBackendOrigin } from '../utils/backendOrigin';
import { useToasts } from '../hooks/useToasts';

type Track = {
  id: number;
  title: string;
  artist: string;
  genre?: string;
  fileUrl: string;
  coverUrl?: string;
  playCount?: number;
  createdAt?: string;
};

export default function MyUploads() {
  const backendOrigin = getBackendOrigin();
  const toast = useToasts((s) => s.push);
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const res = await api.get('/tracks/me/list');
    setTracks(res.data || []);
  }

  useEffect(() => {
    let active = true;
    async function load() {
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
          'Failed to load your uploads';
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

  const songs = useMemo(() => {
    return tracks.map((t) => ({
      key: `user_${t.id}`,
      title: t.title,
      subtitle: t.artist,
      images: { coverart: t.coverUrl ? `${backendOrigin}${t.coverUrl}` : undefined },
      previewUrl: `${backendOrigin}${t.fileUrl}`,
      _trackId: t.id,
      _genre: t.genre,
    }));
  }, [tracks, backendOrigin]);

  async function openEdit(t: Track) {
    setEditTrack(t);
    setTitle(t.title);
    setArtist(t.artist);
    setGenre(t.genre || '');
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editTrack) return;
    setSaving(true);
    try {
      const res = await api.patch(`/tracks/${editTrack.id}`, {
        title: title.trim(),
        artist: artist.trim(),
        genre: genre.trim() || undefined,
      });
      toast('Updated track', 'success');
      setEditOpen(false);
      setEditTrack(null);
      await refresh();
      return res.data;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update track';
      toast(String(msg), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrack(t: Track) {
    const ok = window.confirm(`Delete "${t.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/tracks/${t.id}`);
      toast('Deleted track', 'success');
      await refresh();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete track';
      toast(String(msg), 'error');
    }
  }

  if (loading) return <div className="text-white/80">Loading your uploads…</div>;

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-lg font-semibold">Could not load uploads</div>
        <div className="mt-2 text-sm text-white/80">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">My uploads</h2>
          <p className="text-sm text-white/70 mt-1">{tracks.length} tracks</p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
          You haven’t uploaded any songs yet. Use the Upload page to publish your first track.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
          {songs.map((song: any, i: number) => {
            const t = tracks[i];
            return (
              <div key={song.key} className="relative w-full sm:max-w-[280px]">
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
                    className="rounded-full bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEdit(t);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-red-600/80 px-3 py-1 text-xs text-white hover:bg-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteTrack(t);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Plays: {t.playCount ?? 0}
                  {t.genre ? ` • ${t.genre}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editOpen && editTrack && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onMouseDown={() => setEditOpen(false)}
          role="dialog"
          aria-label="Edit upload"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b18]/95 p-6 text-white shadow-2xl backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold">Edit track</div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-white/80">Title</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/80">Artist</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/80">Genre</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                onClick={saveEdit}
                disabled={saving || title.trim().length < 2 || artist.trim().length < 2}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
