import { useState, useEffect, useCallback } from 'react';
import { ContinueWatchingShow } from '../types';
import { INITIAL_CONTINUE_WATCHING } from '../data/continueWatchingData';
import { catalogRegistry } from '../services/catalog/catalogRegistry';

const STORAGE_KEY = 'xtwo_continue_watching_v2';

export function useContinueWatching() {
  const [continueWatchingList, setContinueWatchingList] = useState<ContinueWatchingShow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse continue watching list:', e);
    }
    return INITIAL_CONTINUE_WATCHING;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(continueWatchingList));
    } catch (e) {
      console.warn('Failed to persist continue watching list:', e);
    }
  }, [continueWatchingList]);

  const updatePlaybackProgress = useCallback((
    showOrId: any,
    episodeNum: number = 1,
    progressPercent: number = 50,
    remainingMinutes: number = 10
  ) => {
    setContinueWatchingList(prev => {
      let showId = typeof showOrId === 'string' ? showOrId : (showOrId.id || `tmdb-tv-${showOrId.tmdbId}`);
      const fullShow = typeof showOrId === 'object' ? showOrId : (catalogRegistry.getById(showId) || catalogRegistry.getByTmdbId(Number(showId)));

      const title = fullShow?.title || fullShow?.name || 'Animated Show';
      const posterUrl = fullShow?.resolvedPosterUrl || fullShow?.posterUrl || fullShow?.poster_path || null;
      const backdropUrl = fullShow?.resolvedBackdropUrl || fullShow?.backdropUrl || fullShow?.backdrop_path || null;
      const totalEpisodes = fullShow?.totalEpisodes || fullShow?.episodesCount || 24;

      const existingIndex = prev.findIndex(item => item.showId === showId || item.id === showId);

      const updatedRecord: ContinueWatchingShow = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `cw-${Date.now()}`,
        showId: showId,
        title: title,
        japaneseTitle: fullShow?.japaneseTitle || '',
        currentEpisode: episodeNum,
        totalEpisodes: totalEpisodes,
        season: 1,
        episodeTitle: `Episode ${episodeNum}`,
        durationMinutes: fullShow?.durationMinutes || 24,
        remainingMinutes: remainingMinutes,
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        posterUrl: posterUrl,
        backdropUrl: backdropUrl,
        genres: fullShow?.genres || ['Animation'],
        studio: fullShow?.studio || 'Studio',
        qualityBadge: '4K UHD',
        matchScore: fullShow?.matchScore || 98,
        lastWatchedAt: 'Just now'
      };

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = updatedRecord;
        return next;
      } else {
        return [updatedRecord, ...prev];
      }
    });
  }, []);

  const removeFromContinueWatching = useCallback((showId: string) => {
    setContinueWatchingList(prev => prev.filter(item => item.showId !== showId && item.id !== showId));
  }, []);

  return {
    continueWatchingList,
    updatePlaybackProgress,
    removeFromContinueWatching
  };
}
