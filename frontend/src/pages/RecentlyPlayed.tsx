import { useSelector } from 'react-redux';
import { SongCard } from '../components';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import type { RootState } from '../redux/store';

export default function RecentlyPlayed() {
  const { items, clear } = useRecentlyPlayed();
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  const songs = items.map((it) => it.song);

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">Recently played</h2>
          <p className="text-sm text-white/70 mt-1">
            {items.length ? `${items.length} tracks` : 'Nothing played yet'}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg sm:mt-0 mt-5"
            onClick={() => clear()}
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
          Start playing songs and they will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
          {songs.map((song: any, i: number) => (
            <SongCard
              key={song.key || song.trackId || `${i}`}
              song={song}
              isPlaying={isPlaying}
              activeSong={activeSong}
              data={songs}
              i={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
