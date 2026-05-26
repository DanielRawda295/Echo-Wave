import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { SongCard } from '../components';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { getBackendOrigin } from '../utils/backendOrigin';
import { useToasts } from '../hooks/useToasts';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

type Track = {
  id: number;
  title: string;
  artist: string;
  genre?: string;
  fileUrl: string;
  coverUrl?: string;
  createdAt?: string;
};

export default function Community() {
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);
  const backendOrigin = getBackendOrigin();
  const toast = useToasts((s) => s.push);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState<Record<number, { likeCount: number; liked: boolean }>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/tracks');
        if (!active) return;
        const list = res.data || [];
        setTracks(list);

        const ids = (list as Track[]).map((t) => t.id).join(',');
        if (ids) {
          try {
            const likeRes = await api.get('/tracks/likes', { params: { ids } });
            if (!active) return;
            const map: Record<number, { likeCount: number; liked: boolean }> = {};
            (likeRes.data || []).forEach((row: any) => {
              map[row.trackId] = { likeCount: row.likeCount, liked: row.liked };
            });
            setLikes(map);
          } catch {
            // ignore likes load errors (still show tracks)
          }
        }
      } catch (err: any) {
        if (!active) return;
        const msg =
          err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load community tracks';
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

  if (loading) return <div className="text-white/80">Loading community uploads…</div>;

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
          <h2 className="font-bold text-3xl text-white text-left">Community</h2>
          <p className="text-sm text-white/70 mt-1">User uploaded tracks you can play.</p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
          No uploads yet. Be the first to publish a song from the Upload page.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
          {songs.map((song: any, i: number) => {
            const trackId = song._trackId as number;
            const likeInfo = likes[trackId] || { likeCount: 0, liked: false };

            return (
              <div key={song.key} className="flex w-full flex-col sm:max-w-[280px]">
                <SongCard
                  song={song}
                  isPlaying={isPlaying}
                  activeSong={activeSong}
                  data={songs}
                  i={i}
                />

                <div className="mt-2 flex items-center justify-between px-1">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                    onClick={async () => {
                      try {
                        const res = await api.post(`/tracks/${trackId}/like`);
                        setLikes((prev) => ({
                          ...prev,
                          [trackId]: { likeCount: res.data.likeCount, liked: res.data.liked },
                        }));
                      } catch (err: any) {
                        const msg =
                          err?.response?.data?.message?.message ||
                          err?.response?.data?.message ||
                          err?.message ||
                          'Failed to like';
                        toast(String(msg), 'error');
                      }
                    }}
                    aria-label={likeInfo.liked ? 'Unlike' : 'Like'}
                  >
                    {likeInfo.liked ? <FaHeart className="text-pink-400" /> : <FaRegHeart />}
                    {likeInfo.likeCount}
                  </button>

                  <Link
                    to={`/songs/${song.key}`}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    Comments
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
