import { TmdbAnimatedShow } from '../data/tmdbData';
import { WatchProgressTracker } from '../utils/watchProgressTracker';

import { SeasonFetcherService, Episode } from '../services/seasonFetcherService';
import { LatencyTracker, ServerPingResult, ServerResolver } from '../utils/serverResolver';
import { getRelatedShows } from '../utils/relatedResolver';
import { globalCatalogIndex } from '../utils/globalCatalog';
import { TMDB_ANIMATED_CATALOG } from '../data/tmdbData';
import { createEpisodeNumber, createSeasonNumber, createTmdbShowId } from '../types/identifiers';

export interface PlaybackQueryInput {
  show: TmdbAnimatedShow;
  requestedSeason?: number;
  requestedEpisode?: number;
}

export interface PlaybackQueryResult {
  selectedSeason: number;
  currentEpisode: number;
  resumeTime: number;
  serverId: string | null;
  seasonEpisodesMap: Record<number, Episode[]>;
  relatedShows: TmdbAnimatedShow[];
  serverLatencies: Record<string, ServerPingResult>;
  isMovie: boolean;
  totalSeasons: number;
}

export class ResolvePlaybackQuery {
  public static async execute(input: PlaybackQueryInput): Promise<PlaybackQueryResult> {
    const { show } = input;
    const isMovie = show.media_type === 'movie' || show.navType === 'Movies' || (show.durationMinutes && show.durationMinutes > 60);
    const totalSeasons = show.seasonCount || (isMovie ? 1 : 2);
    
    // 1. Hydrate watch progress to resolve initial season/episode/time
    let selectedSeason = input.requestedSeason || 1;
    let currentEpisode = input.requestedEpisode || 1;
    let resumeTime = 0;
    
    if (show.id) {
      const saved = WatchProgressTracker.getProgress(show.id);
      if (saved) {
        if (!input.requestedSeason && saved.season) selectedSeason = saved.season;
        if (!input.requestedEpisode && saved.episode) currentEpisode = saved.episode;
        if (saved.durationSeconds === 0 || saved.timestampSeconds < (saved.durationSeconds || 0) - 30) {
          resumeTime = saved.timestampSeconds || 0;
        }
      }
    }
    
    // 2. Resolve fastest server
    const { selectedServer } = await ServerResolver.resolveFastestServer(show, selectedSeason, currentEpisode, 1500);
    const serverId = selectedServer ? selectedServer.id : null;
    
    // 3. Fetch Season Episodes Map
    let seasonEpisodesMap: Record<number, Episode[]> = {};
    if (isMovie) {
      seasonEpisodesMap = {
        1: [{
          id: show.tmdbId || 1,
          number: createEpisodeNumber(1),
          seasonNumber: createSeasonNumber(1),
          providerId: createTmdbShowId(show.tmdbId || 1),
          title: show.title || show.name || 'Animated Show',
          overview: show.overview || 'Full Feature Presentation.',
          stillUrl: show.backdropUrl || null,
          airDate: show.first_air_date ? show.first_air_date.substring(0, 4) : '2023',
          voteAverage: show.vote_average || 8.8,
          runtimeMinutes: show.durationMinutes || 120,
        } as unknown as Episode]
      };
    } else {
      seasonEpisodesMap = await SeasonFetcherService.fetchAllSeasonsAndEpisodes(show);
    }
    
    // 4. Resolve Related Shows
    const catalogPool = globalCatalogIndex.getAll().length > 0 ? globalCatalogIndex.getAll() : TMDB_ANIMATED_CATALOG;
    const items = getRelatedShows(show, catalogPool);
    let relatedShows = items;
    if (items.length < 4) {
      const fillers = catalogPool.filter(s => s.id !== show.id && !items.some(i => i.id === s.id)).slice(0, 6 - items.length);
      relatedShows = [...items, ...fillers];
    } else {
      relatedShows = items.slice(0, 6);
    }
    
    // 5. Ping servers for latencies
    const serverLatencies = await LatencyTracker.pingServers(show);
    
    return {
      selectedSeason,
      currentEpisode,
      resumeTime,
      serverId,
      seasonEpisodesMap,
      relatedShows,
      serverLatencies,
      isMovie,
      totalSeasons
    };
  }
}
