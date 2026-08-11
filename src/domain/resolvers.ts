import type { TmdbAnimatedShow } from '../data/tmdbData';
import { createEpisodeIdentity, createSeasonIdentity, createShowIdentity, type EpisodeIdentity, type MediaType, type SeasonIdentity, type ShowIdentity } from './mediaIdentity';
import { isTrustedTmdbImage, validateEpisodeRelationship, validateShowRelationship } from './validation';
import type { RawTmdbEpisode, RawTmdbMedia, RawTmdbSeason } from '../providers/tmdbProvider';

const genreMap: Record<number, string> = {
  16: 'Animation', 10759: 'Action & Adventure', 10765: 'Sci-Fi & Fantasy', 18: 'Drama',
  35: 'Comedy', 14: 'Fantasy', 878: 'Sci-Fi', 28: 'Action', 12: 'Adventure', 10751: 'Family',
};
const imageUrl = (path: unknown, size: 'w500' | 'original'): string | undefined => {
  if (typeof path !== 'string' || !path) return undefined;
  if (path.startsWith('/')) return `https://image.tmdb.org/t/p/${size}${path}`;
  return isTrustedTmdbImage(path) ? path : undefined;
};

export interface CanonicalEpisode {
  id: number;
  number: number;
  seasonNumber: number;
  title: string;
  overview: string;
  stillPath: string | null;
  stillUrl: string | null;
  airDate: string;
  voteAverage: number;
  runtimeMinutes?: number;
}

export function resolveShowIdentity(show: Partial<TmdbAnimatedShow>): ShowIdentity | null {
  return createShowIdentity(show.tmdbId, show.media_type);
}

export function resolveTmdbShow(raw: RawTmdbMedia, mediaType: MediaType, page = 1): TmdbAnimatedShow | null {
  const identity = createShowIdentity(raw.id, mediaType);
  if (!identity || !validateShowRelationship({ id: raw.id, media_type: mediaType }, identity)) return null;
  const title = raw.title || raw.name || raw.original_title || raw.original_name;
  if (!title?.trim()) return null;
  const genres = raw.genres?.map((genre) => genre.name).filter(Boolean)
    ?? (raw.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);
  const posterUrl = imageUrl(raw.poster_path, 'w500');
  const backdropUrl = imageUrl(raw.backdrop_path, 'original');
  return {
    id: `tmdb-${mediaType}-${identity.providerId}`,
    tmdbId: identity.providerId,
    title,
    name: raw.name || raw.title,
    original_title: raw.original_title,
    original_name: raw.original_name,
    poster_path: typeof raw.poster_path === 'string' && raw.poster_path.startsWith('/') ? raw.poster_path : null,
    posterUrl: posterUrl || null,
    resolvedPosterUrl: posterUrl || null,
    backdrop_path: typeof raw.backdrop_path === 'string' && raw.backdrop_path.startsWith('/') ? raw.backdrop_path : null,
    backdropUrl,
    resolvedBackdropUrl: backdropUrl || null,
    overview: raw.overview || 'Synopsis unavailable.',
    vote_average: Number.isFinite(raw.vote_average) ? Number(raw.vote_average) : 0,
    vote_count: Number.isFinite(raw.vote_count) ? Number(raw.vote_count) : 0,
    first_air_date: raw.first_air_date,
    release_date: raw.release_date,
    genres: genres.length ? genres : ['Animation'],
    genre_ids: raw.genre_ids || raw.genres?.map((genre) => genre.id) || [16],
    media_type: mediaType,
    mediaType,
    navType: mediaType === 'tv' ? 'TV' : 'Movies',
    category: page % 2 ? 'For You' : 'Explore More',
    durationMinutes: mediaType === 'movie' ? 110 : 24,
    totalEpisodes: mediaType === 'movie' ? 1 : undefined,
    seasonCount: mediaType === 'movie' ? 1 : undefined,
    qualityBadges: ['4K UHD'],
    matchScore: Math.max(0, Math.min(100, Math.round((raw.vote_average || 0) * 10))),
  };
}

export function resolveSeasonIdentity(show: Partial<TmdbAnimatedShow>, seasonNumber: number): SeasonIdentity | null {
  const showIdentity = resolveShowIdentity(show);
  return showIdentity ? createSeasonIdentity(showIdentity, seasonNumber) : null;
}

function resolveEpisode(raw: RawTmdbEpisode, identity: EpisodeIdentity): CanonicalEpisode | null {
  const number = Number(raw.episode_number);
  const seasonNumber = Number(raw.season_number ?? identity.seasonNumber);
  if (!validateEpisodeRelationship({ number, seasonNumber }, identity)) return null;
  return {
    id: Number.isInteger(raw.id) && raw.id! > 0 ? raw.id! : identity.providerId * 1_000_000 + identity.seasonNumber * 10_000 + identity.episodeNumber,
    number,
    seasonNumber,
    title: raw.name?.trim() || `Episode ${number}`,
    overview: raw.overview?.trim() || 'Synopsis unavailable.',
    stillPath: typeof raw.still_path === 'string' && raw.still_path.startsWith('/') ? raw.still_path : null,
    stillUrl: imageUrl(raw.still_path, 'w500') || null,
    airDate: raw.air_date || '',
    voteAverage: Number.isFinite(raw.vote_average) ? Number(raw.vote_average) : 0,
    runtimeMinutes: Number.isFinite(raw.runtime) ? Number(raw.runtime) : undefined,
  };
}

export function resolveTmdbSeason(raw: RawTmdbSeason, identity: SeasonIdentity): CanonicalEpisode[] | null {
  if (Number(raw.season_number ?? identity.seasonNumber) !== identity.seasonNumber || !Array.isArray(raw.episodes)) return null;
  const episodes = raw.episodes
    .map((item) => {
      const episodeIdentity = createEpisodeIdentity(identity, item.episode_number);
      return episodeIdentity ? resolveEpisode(item, episodeIdentity) : null;
    })
    .filter((item): item is CanonicalEpisode => item !== null)
    .sort((a, b) => a.number - b.number);
  return episodes.length ? episodes : null;
}

export function createDeterministicEpisodeFallback(identity: SeasonIdentity, count = 12): CanonicalEpisode[] {
  return Array.from({ length: count }, (_, index) => {
    const episodeIdentity = createEpisodeIdentity(identity, index + 1)!;
    return {
      id: episodeIdentity.providerId * 1_000_000 + episodeIdentity.seasonNumber * 10_000 + episodeIdentity.episodeNumber,
      number: episodeIdentity.episodeNumber,
      seasonNumber: episodeIdentity.seasonNumber,
      title: `Episode ${episodeIdentity.episodeNumber}`,
      overview: 'Episode metadata is temporarily unavailable.',
      stillPath: null,
      stillUrl: null,
      airDate: '',
      voteAverage: 0,
      runtimeMinutes: 24,
    };
  });
}
