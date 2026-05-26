import React from 'react';
import { useSelector } from 'react-redux';
import { SongCard } from '../components';
import { useFavorites } from '../hooks/useFavorites';
import type { RootState } from '../redux/store';

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const { activeSong, isPlaying } = useSelector((state: RootState) => state.player);

  const songs = favorites.map((f) => f.song);

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <div>
          <h2 className="font-bold text-3xl text-white text-left">Liked Songs</h2>
          <p className="text-sm text-white/70 mt-1">
            {favorites.length ? `${favorites.length} saved` : 'No favorites yet'}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg sm:mt-0 mt-5"
            onClick={() => useFavorites.getState().clearFavorites()}
          >
            Clear all
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
          <div className="text-lg font-semibold text-white">Start liking songs</div>
          <div className="mt-2 text-sm">
            Tap the heart on any song card to save it here for quick access.
          </div>
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
};

export default Favorites;
