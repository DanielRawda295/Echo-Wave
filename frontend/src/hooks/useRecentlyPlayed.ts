import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { accountLibraryKey, accountLibraryStorage, getStoredAccountId, migrateCurrentLibrary } from '../utils/accountLibrary';

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

const initialAccount = getStoredAccountId();
migrateCurrentLibrary('recentlyPlayed', initialAccount);

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
    {
      name: accountLibraryKey('recentlyPlayed', initialAccount),
      storage: createJSONStorage(() => accountLibraryStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (saved, current) => ({
        ...current,
        items: Array.isArray((saved as Partial<RecentlyPlayedState> | undefined)?.items)
          ? (saved as RecentlyPlayedState).items.slice(0, 100) : [],
      }),
    }
  )
);

export function selectRecentlyPlayedAccount(accountId: string | null) {
  useRecentlyPlayed.persist.setOptions({ name: accountLibraryKey('recentlyPlayed', accountId) });
  void useRecentlyPlayed.persist.rehydrate();
}
