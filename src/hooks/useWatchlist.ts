import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem, WatchlistStatus } from '../types';
import { INITIAL_WATCHLIST } from '../data/watchlistData';
import { catalogRegistry } from '../services/catalog/catalogRegistry';

const STORAGE_KEY = 'xtwo_user_watchlist_v2';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse watchlist:', e);
    }
    return INITIAL_WATCHLIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to persist watchlist:', e);
    }
  }, [watchlist]);

  const isWatchlisted = useCallback((showId: string): boolean => {
    return watchlist.some(item => item.showId === showId || item.id === showId);
  }, [watchlist]);

  const toggleWatchlist = useCallback((showOrId: any) => {
    const showId = typeof showOrId === 'string' ? showOrId : (showOrId.id || `tmdb-tv-${showOrId.tmdbId}`);
    
    setWatchlist(prev => {
      const existingIndex = prev.findIndex(item => item.showId === showId || item.id === showId);
      
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        const fullShow = typeof showOrId === 'object' ? showOrId : (catalogRegistry.getById(showId) || catalogRegistry.getByTmdbId(Number(showId)));
        
        const newItem: WatchlistItem = {
          id: `wl-${Date.now()}`,
          showId: showId,
          title: fullShow?.title || fullShow?.name || 'Animated Show',
          japaneseTitle: fullShow?.japaneseTitle || '',
          status: 'Planned',
          releaseYear: fullShow?.first_air_date ? parseInt(fullShow.first_air_date.slice(0, 4), 10) : 2024,
          genres: fullShow?.genres || ['Animation'],
          studio: fullShow?.studio || 'Studio',
          score: fullShow?.vote_average || 8.5,
          userRating: 0,
          matchScore: fullShow?.matchScore || 95,
          episodesWatched: 0,
          totalEpisodes: fullShow?.totalEpisodes || fullShow?.episodesCount || 24,
          durationMinutes: fullShow?.durationMinutes || 24,
          progressPercent: 0,
          posterUrl: fullShow?.resolvedPosterUrl || fullShow?.posterUrl || fullShow?.poster_path || null,
          backdropUrl: fullShow?.resolvedBackdropUrl || fullShow?.backdropUrl || fullShow?.backdrop_path || null,
          synopsis: fullShow?.overview || '',
          qualityBadges: fullShow?.qualityBadges || ['4K UHD'],
          addedAt: 'Just now',
          category: fullShow?.category || 'Cause You Like'
        };
        return [newItem, ...prev];
      }
    });
  }, []);

  const updateStatus = useCallback((showId: string, status: WatchlistStatus) => {
    setWatchlist(prev => prev.map(item => {
      if (item.showId === showId || item.id === showId) {
        return { ...item, status };
      }
      return item;
    }));
  }, []);

  const updateEpisodesWatched = useCallback((showId: string, episodesWatched: number) => {
    setWatchlist(prev => prev.map(item => {
      if (item.showId === showId || item.id === showId) {
        const progressPercent = item.totalEpisodes > 0 ? Math.round((episodesWatched / item.totalEpisodes) * 100) : 0;
        return { ...item, episodesWatched, progressPercent };
      }
      return item;
    }));
  }, []);

  const updateUserRating = useCallback((showId: string, userRating: number) => {
    setWatchlist(prev => prev.map(item => {
      if (item.showId === showId || item.id === showId) {
        return { ...item, userRating };
      }
      return item;
    }));
  }, []);

  const removeFromWatchlist = useCallback((showId: string) => {
    setWatchlist(prev => prev.filter(item => item.showId !== showId && item.id !== showId));
  }, []);

  return {
    watchlist,
    isWatchlisted,
    toggleWatchlist,
    updateStatus,
    updateEpisodesWatched,
    updateUserRating,
    removeFromWatchlist
  };
}
