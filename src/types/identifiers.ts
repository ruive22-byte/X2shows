// src/types/identifiers.ts

// Declare unique brands to enforce compile-time safety
declare const __brand: unique symbol;
export type Brand<T, TBrand> = T & { readonly [__brand]: TBrand };

export type TmdbShowId = Brand<number, 'TmdbShowId'>;
export type SeasonNumber = Brand<number, 'SeasonNumber'>;
export type EpisodeNumber = Brand<number, 'EpisodeNumber'>;

export type CanonicalCacheKey = Brand<string, 'CanonicalCacheKey'>;

// Safe runtime casting helpers
export const createTmdbShowId = (id: number): TmdbShowId => id as TmdbShowId;
export const createSeasonNumber = (num: number): SeasonNumber => num as SeasonNumber;
export const createEpisodeNumber = (num: number): EpisodeNumber => num as EpisodeNumber;

// Identity-based deterministic cache key generator
export function getCanonicalCacheKey(
  provider: 'tmdb' | 'tvmaze' | 'omdb',
  showId: TmdbShowId,
  season?: SeasonNumber,
  episode?: EpisodeNumber
): CanonicalCacheKey {
  if (season !== undefined && episode !== undefined) {
    return `${provider}:show:${showId}:season:${season}:episode:${episode}` as CanonicalCacheKey;
  }
  if (season !== undefined) {
    return `${provider}:show:${showId}:season:${season}` as CanonicalCacheKey;
  }
  return `${provider}:show:${showId}` as CanonicalCacheKey;
}
