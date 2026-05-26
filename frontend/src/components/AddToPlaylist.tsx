import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import api from '../utils/api';
import { useToasts } from '../hooks/useToasts';

type Playlist = {
  id: number;
  name: string;
};

function getExternalId(song: any, fallbackIndex?: number) {
  return String(song?.key ?? song?.trackId ?? song?.id ?? fallbackIndex ?? '');
}

function toPlaylistItem(song: any, fallbackIndex?: number) {
  return {
    externalId: getExternalId(song, fallbackIndex),
    title: song?.title ?? song?.trackName,
    artist: song?.subtitle ?? song?.artistName,
    artwork: song?.images?.coverart ?? song?.artworkUrl100,
    previewUrl: song?.previewUrl,
    raw: song,
  };
}

export default function AddToPlaylist({
  song,
  index,
}: {
  song: any;
  index?: number;
}) {
  const toast = useToasts((s) => s.push);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const externalId = useMemo(() => getExternalId(song, index), [song, index]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function load() {
      setError('');
      setSavedMsg('');
      setLoading(true);
      try {
        const res = await api.get('/playlists/me');
        if (!active) return;
        const list = (res.data || []) as Playlist[];
        setPlaylists(list);
        setSelectedId(list[0]?.id ?? '');
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
  }, [open]);

  async function createPlaylist() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/playlists', { name });
      const created = res.data as Playlist;
      const next = [created, ...playlists];
      setPlaylists(next);
      setSelectedId(created.id);
      setNewName('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create playlist';
      setError(String(msg));
      toast(String(msg), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function add() {
    if (!selectedId) return;
    if (!externalId) {
      setError('This song has no stable id to add.');
      return;
    }
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      await api.post(`/playlists/${selectedId}/items`, toPlaylistItem(song, index));
      setSavedMsg('Added to playlist');
      toast('Added to playlist', 'success');
      window.setTimeout(() => setSavedMsg(''), 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add to playlist';
      setError(String(msg));
      toast(String(msg), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Add to playlist"
        title="Add to playlist"
      >
        <FiPlus />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onMouseDown={() => setOpen(false)}
          role="dialog"
          aria-label="Add to playlist dialog"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b18]/95 p-5 text-white shadow-2xl backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">Add to playlist</div>
                <div className="truncate text-xs text-white/70">
                  {song?.title ?? song?.trackName ?? 'Selected song'}
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="text-sm text-white/80">Loading…</div>
              ) : (
                <>
                  <label className="text-sm text-white/80">Choose a playlist</label>
                  <select
                    className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
                  >
                    {playlists.length === 0 ? (
                      <option value="">No playlists yet</option>
                    ) : (
                      playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name}
                        </option>
                      ))
                    )}
                  </select>

                  <button
                    type="button"
                    className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                    disabled={saving || !selectedId}
                    onClick={add}
                  >
                    {saving ? 'Adding…' : 'Add'}
                  </button>
                </>
              )}

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Or create a new playlist</div>
                <div className="mt-3 flex gap-2 sm:flex-row flex-col">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Playlist name"
                    className="h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    className="h-11 rounded-xl bg-white/10 px-5 text-white hover:bg-white/15 disabled:opacity-50"
                    disabled={saving || newName.trim().length < 2}
                    onClick={createPlaylist}
                  >
                    {saving ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </div>

              {savedMsg && <div className="mt-3 text-sm text-green-300">{savedMsg}</div>}
              {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
