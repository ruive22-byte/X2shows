import { EpisodeIdentity, ShowIdentity } from './mediaIdentity';

const tmdbImageHosts = new Set(['image.tmdb.org', 'images.tmdb.org', 'media.themoviedb.org']);
const playbackHosts = new Set(['vidlink.pro', 'vidsrc.pro', 'multiembed.mov', 'www.2embed.cc', 'vidsrc.vip']);

export function isSafeHttpUrl(value: unknown, allowedHosts?: ReadonlySet<string>): value is string {
  if (typeof value !== 'string' || value.length > 2_048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (!allowedHosts || allowedHosts.has(url.hostname));
  } catch {
    return false;
  }
}

export function isTrustedTmdbImage(value: unknown): value is string {
  return isSafeHttpUrl(value, tmdbImageHosts);
}

export function isTrustedPlaybackUrl(value: unknown): value is string {
  return isSafeHttpUrl(value, playbackHosts);
}

export function validateEpisodeRelationship(
  episode: { seasonNumber: unknown; number: unknown },
  identity: EpisodeIdentity,
): boolean {
  return Number(episode.seasonNumber) === identity.seasonNumber
    && Number(episode.number) === identity.episodeNumber;
}

export function validateShowRelationship(
  raw: { id?: unknown; media_type?: unknown },
  identity: ShowIdentity,
): boolean {
  return Number(raw.id) === identity.providerId && raw.media_type === identity.mediaType;
}
