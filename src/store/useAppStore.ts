import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WatchProgressItem {
  showId: string;
  title: string;
  season: number;
  episode: number;
  progressSeconds: number;
  durationSeconds: number;
  updatedAt: number;
}

interface AppStoreState {
  watchlist: string[];
  continueWatching: Record<string, WatchProgressItem>;
  
  toggleWatchlist: (showId: string) => void;
  isInWatchlist: (showId: string) => boolean;
  updateWatchProgress: (item: Omit<WatchProgressItem, 'updatedAt'>) => void;
  clearProgress: (showId: string) => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      continueWatching: {},

      toggleWatchlist: (showId: string) => {
        set((state) => {
          const exists = state.watchlist.includes(showId);
          return {
            watchlist: exists
              ? state.watchlist.filter((id) => id !== showId)
              : [...state.watchlist, showId],
          };
        });
      },

      isInWatchlist: (showId: string) => {
        return get().watchlist.includes(showId);
      },

      updateWatchProgress: (item) => {
        set((state) => ({
          continueWatching: {
            ...state.continueWatching,
            [item.showId]: {
              ...item,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      clearProgress: (showId: string) => {
        set((state) => {
          const updated = { ...state.continueWatching };
          delete updated[showId];
          return { continueWatching: updated };
        });
      },
    }),
    {
      name: 'app-global-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            if (!true) return null;
            return localStorage.getItem(name);
          } catch (e) {
            console.warn('[Store Hydration Recovery]:', e);
            return localStorage.getItem(name);
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch {}
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      })),
    }
  )
);
