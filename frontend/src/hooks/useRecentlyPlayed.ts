import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecentlyPlayedItem = {
  id: string;
  song: any;
  playedAt: number;
};

function getSongId(song: any) {
  return String(song?.key ?? song?.trackId ?? song?.id ?? song?.url ?? '');
}

type RecentlyPlayedState = {
  items: RecentlyPlayedItem[];
  add: (song: any) => void;
  clear: () => void;
};

export const useRecentlyPlayed = create<RecentlyPlayedState>()(
  persist(
    (set) => ({
      items: [],
      add: (song) => {
        const id = getSongId(song);
        if (!id) return;
        const next: RecentlyPlayedItem = { id, song, playedAt: Date.now() };
        set((state) => ({
          items: [next, ...state.items.filter((it) => it.id !== id)].slice(0, 100),
        }));
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'echowave.recentlyPlayed.v1' }
  )
);
