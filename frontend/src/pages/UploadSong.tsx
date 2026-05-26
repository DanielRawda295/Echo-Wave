import { useMemo, useState } from 'react';
import api from '../utils/api';
import { useToasts } from '../hooks/useToasts';

export default function UploadSong() {
  const toast = useToasts((s) => s.push);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 1 && artist.trim().length > 1 && !!audio;
  }, [title, artist, audio]);

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('artist', artist.trim());
      if (genre.trim()) form.append('genre', genre.trim());
      if (cover) form.append('cover', cover);
      if (audio) form.append('audio', audio);

      await api.post('/tracks/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast('Song uploaded', 'success');
      setTitle('');
      setArtist('');
      setGenre('');
      setCover(null);
      setAudio(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Upload failed';
      toast(String(msg), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">Upload a song</h2>
          <p className="text-sm text-white/70 mt-1">Publish your own track to EchoWave.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div>
            <label className="text-sm text-white/80">Song title</label>
            <input
              className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Artist name</label>
            <input
              className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Genre</label>
            <input
              className="mt-2 h-11 w-full rounded-xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Pop, Hip-Hop, Rock…"
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Cover image</label>
            <input
              className="mt-2 w-full text-sm text-white/80"
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
            />
          </div>

          <div className="xl:col-span-2">
            <label className="text-sm text-white/80">MP3 file</label>
            <input
              className="mt-2 w-full text-sm text-white/80"
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              onChange={(e) => setAudio(e.target.files?.[0] || null)}
            />
            <div className="mt-2 text-xs text-white/60">Max 25MB. MP3 only.</div>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-white hover:bg-indigo-500 disabled:opacity-50"
          disabled={!canSubmit || submitting}
          onClick={submit}
        >
          {submitting ? 'Uploading…' : 'Publish'}
        </button>
      </div>
    </div>
  );
}

