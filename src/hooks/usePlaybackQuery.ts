import { useState, useEffect, useCallback, useRef } from 'react';
import { ResolvePlaybackQuery, PlaybackQueryResult } from '../use-cases/ResolvePlaybackQuery';
import { TmdbAnimatedShow } from '../data/tmdbData';
import { appEvents } from '../events/EventEmitter';
import { MediaOrchestrator, OrchestratedMedia } from '../services/resolvers/MediaOrchestrator';

export function usePlaybackQuery(show: TmdbAnimatedShow, initialSeasonNumber?: number, initialEpisodeNumber?: number) {
  const [queryState, setQueryState] = useState<{
    isLoading: boolean;
    result: PlaybackQueryResult | null;
    error: Error | null;
  }>({
    isLoading: true,
    result: null,
    error: null
  });

  const [activeSeason, setActiveSeason] = useState<number>(initialSeasonNumber || 1);
  const [activeEpisode, setActiveEpisode] = useState<number>(initialEpisodeNumber || 1);
  const [activeServerId, setActiveServerId] = useState<string>('server-1');
  
  // Now we store the orchestrated media
  const [orchestratedMedia, setOrchestratedMedia] = useState<OrchestratedMedia | null>(null);

  // Ref to hold playback time so we don't cause renders on every tick
  const playbackTimeRef = useRef<{current: number, duration: number}>({ current: 0, duration: 0 });

  useEffect(() => {
    let active = true;
    setQueryState(prev => ({ ...prev, isLoading: true }));
    
    ResolvePlaybackQuery.execute({ show, requestedSeason: initialSeasonNumber, requestedEpisode: initialEpisodeNumber })
      .then(result => {
        if (active) {
          setQueryState({ isLoading: false, result, error: null });
          setActiveSeason(result.selectedSeason);
          setActiveEpisode(result.currentEpisode);
        }
      })
      .catch(error => {
        if (active) {
          setQueryState({ isLoading: false, result: null, error });
        }
      });
      
    return () => { active = false; };
  }, [show, initialSeasonNumber, initialEpisodeNumber]);

  // Handle media orchestration when episode changes
  useEffect(() => {
    let active = true;
    if (!queryState.isLoading && queryState.result) {
      MediaOrchestrator.resolveMedia(show, activeSeason, activeEpisode).then(media => {
        if (active) {
          setOrchestratedMedia(media);
        }
      });
    }
    return () => { active = false; };
  }, [show, activeSeason, activeEpisode, queryState.isLoading]);

  const changeEpisode = useCallback((season: number, episode: number) => {
    setActiveSeason(season);
    setActiveEpisode(episode);
    setOrchestratedMedia(null);
  }, []);

  // Expose a method for the player to call that debounces progress updates
  const updateProgress = useCallback((current: number, duration: number) => {
    playbackTimeRef.current = { current, duration };
    if (show.id && activeSeason && activeEpisode && duration > 0) {
      appEvents.emit('EpisodeProgressUpdated', {
        showId: typeof show.id === 'string' ? parseInt(show.id.replace(/\D/g, '')) || 0 : show.id,
        seasonNumber: activeSeason,
        episodeNumber: activeEpisode,        currentTime: current,
        duration: duration
      });
    }
  }, [show.id, activeSeason, activeEpisode]);

  return {
    ...queryState,
    activeSeason,
    activeEpisode,
    orchestratedMedia,
    changeEpisode,
    updateProgress,
    activeServerId,
    setActiveServerId,
  };
}
