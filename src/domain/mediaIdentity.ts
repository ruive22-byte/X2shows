export type MediaProvider = 'tmdb';
export type MediaType = 'tv' | 'movie';

export interface ShowIdentity {
  provider: MediaProvider;
  providerId: number;
  mediaType: MediaType;
}

export interface SeasonIdentity extends ShowIdentity {
  seasonNumber: number;
}

export interface EpisodeIdentity extends SeasonIdentity {
  episodeNumber: number;
}

const positiveInteger = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export function createShowIdentity(
  providerId: unknown,
  mediaType: unknown,
  provider: MediaProvider = 'tmdb',
): ShowIdentity | null {
  const id = positiveInteger(providerId);
  if (!id || (mediaType !== 'tv' && mediaType !== 'movie')) return null;
  return { provider, providerId: id, mediaType };
}

export function createSeasonIdentity(
  show: ShowIdentity,
  seasonNumber: unknown,
): SeasonIdentity | null {
  const season = positiveInteger(seasonNumber);
  if (!season || show.mediaType !== 'tv') return null;
  return { ...show, seasonNumber: season };
}

export function createEpisodeIdentity(
  season: SeasonIdentity,
  episodeNumber: unknown,
): EpisodeIdentity | null {
  const episode = positiveInteger(episodeNumber);
  return episode ? { ...season, episodeNumber: episode } : null;
}

export const mediaCacheKeys = {
  show: (show: ShowIdentity) => `show:${show.provider}:${show.providerId}:${show.mediaType}`,
  season: (season: SeasonIdentity) =>
    `season:${season.provider}:${season.providerId}:${season.mediaType}:${season.seasonNumber}`,
  episode: (episode: EpisodeIdentity) =>
    `episode:${episode.provider}:${episode.providerId}:${episode.mediaType}:${episode.seasonNumber}:${episode.episodeNumber}`,
  playback: (episode: EpisodeIdentity, sourceId: string) =>
    `playback:${episode.provider}:${episode.providerId}:${episode.seasonNumber}:${episode.episodeNumber}:${sourceId}`,
};
