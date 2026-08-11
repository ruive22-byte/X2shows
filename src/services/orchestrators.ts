import type { TmdbAnimatedShow } from '../data/tmdbData';
import { mediaCacheKeys, type MediaType } from '../domain/mediaIdentity';
import { createDeterministicEpisodeFallback, resolveSeasonIdentity, resolveTmdbSeason, resolveTmdbShow, type CanonicalEpisode } from '../domain/resolvers';
import { tmdbProvider } from '../providers/tmdbProvider';
import { TmdbIndexedDb } from '../utils/tmdbIndexedDb';

export class ShowOrchestrator {
  static async discover(mediaType: MediaType, page = 1): Promise<{ shows: TmdbAnimatedShow[]; totalPages: number; page: number }> {
    const response = await tmdbProvider.discover(mediaType, page);
    const shows = (response?.results || [])
      .map((raw) => resolveTmdbShow(raw, mediaType, page))
      .filter((show): show is TmdbAnimatedShow => show !== null);
    return { shows, totalPages: response?.total_pages || 0, page: response?.page || page };
  }

  static async getShow(tmdbId: number, mediaType: MediaType, language = 'en-US'): Promise<TmdbAnimatedShow | null> {
    const identity = { provider: 'tmdb' as const, providerId: tmdbId, mediaType };
    const cacheKey = mediaCacheKeys.show(identity);
    const cached = await TmdbIndexedDb.get<TmdbAnimatedShow>(cacheKey);
    if (cached) return cached;
    const raw = await tmdbProvider.getShow(identity, language);
    const show = raw ? resolveTmdbShow(raw, mediaType) : null;
    if (show) await TmdbIndexedDb.set(cacheKey, show);
    return show;
  }
}

export class EpisodeOrchestrator {
  static async getSeasonEpisodes(show: Partial<TmdbAnimatedShow>, seasonNumber = 1): Promise<CanonicalEpisode[]> {
    const identity = resolveSeasonIdentity(show, seasonNumber);
    if (!identity) return [];
    const cacheKey = mediaCacheKeys.season(identity);
    const cached = await TmdbIndexedDb.get<CanonicalEpisode[]>(cacheKey);
    if (cached) return cached;
    const raw = await tmdbProvider.getSeason(identity);
    const episodes = raw ? resolveTmdbSeason(raw, identity) : null;
    const resolved = episodes || createDeterministicEpisodeFallback(identity);
    await TmdbIndexedDb.set(cacheKey, resolved);
    return resolved;
  }
}
