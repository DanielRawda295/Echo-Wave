import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavoriteSong = {
  id: string;
  title?: string;
  artist?: string;
  artwork?: string;
  song: any;
  createdAt: number;
};

function getSongId(song: any, fallbackIndex?: number) {
  return (
    String(
      song?.key ??
        song?.trackId ??
        song?.id ??
        song?.url ??
        song?.hub?.actions?.[0]?.id ??
        fallbackIndex ??
        ''
    ) || ''
  );
}

function pickSongMeta(song: any) {
  return {
    title: song?.title ?? song?.trackName,
    artist: song?.subtitle ?? song?.artistName,
    artwork: song?.images?.coverart ?? song?.artworkUrl100,
  };
}

type FavoritesState = {
  favorites: FavoriteSong[];
  isFavorite: (song: any, fallbackIndex?: number) => boolean;
  toggleFavorite: (song: any, fallbackIndex?: number) => void;
  removeFavoriteById: (id: string) => void;
  clearFavorites: () => void;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isFavorite: (song, fallbackIndex) => {
        const id = getSongId(song, fallbackIndex);
        if (!id) return false;
        return get().favorites.some((f) => f.id === id);
      },
      toggleFavorite: (song, fallbackIndex) => {
        const id = getSongId(song, fallbackIndex);
        if (!id) return;

        const exists = get().favorites.some((f) => f.id === id);
        if (exists) {
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== id),
          }));
          return;
        }

        const meta = pickSongMeta(song);
        const next: FavoriteSong = {
          id,
          ...meta,
          song,
          createdAt: Date.now(),
        };

        set((state) => ({
          favorites: [next, ...state.favorites].slice(0, 200),
        }));
      },
      removeFavoriteById: (id) => {
        set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) }));
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: 'echowave.favorites.v1' }
  )
);

