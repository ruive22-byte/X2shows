import { sanitizeUrl } from '../services/security/privacyShield';

export interface MediaCatalogItem {
  poster_path?: string | null;
  posterPath?: string | null;
  posterUrl?: string | null;
  resolvedPosterUrl?: string | null;
  backdrop_path?: string | null;
  backdropPath?: string | null;
  backdropUrl?: string | null;
  resolvedBackdropUrl?: string | null;
  Poster?: string | null;
  image?: {
    original?: string | null;
    medium?: string | null;
  } | string | null;
  title?: string;
  name?: string;
  [key: string]: any;
}

// Multi-CDN host definitions for primary and mirror fallback domains
const PRIMARY_TMDB_CDN = 'https://image.tmdb.org/t/p/w500';
const SECONDARY_TMDB_CDN = 'https://images.tmdb.org/t/p/w500';
const BACKUP_TMDB_CDN = 'https://media.themoviedb.org/t/p/w500';

const PRIMARY_BACKDROP_CDN = 'https://image.tmdb.org/t/p/original';
const SECONDARY_BACKDROP_CDN = 'https://images.tmdb.org/t/p/original';
const BACKUP_BACKDROP_CDN = 'https://media.themoviedb.org/t/p/original';

const DEFAULT_SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%230b1e28"/><text x="50%" y="50%" fill="%2314b8a6" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">ANIMATED SHOW</text></svg>';

/**
 * Returns an ordered array of candidate image URLs for multi-CDN fallback.
 * Allows <img> elements to cycle through fallback URLs on error.
 */
export function getPosterFallbackChain(
  item: MediaCatalogItem | null | undefined
): string[] {
  if (!item) return [DEFAULT_SVG_PLACEHOLDER];

  const candidates: string[] = [];

  const addCandidate = (rawUrl: string | null | undefined) => {
    if (!rawUrl || typeof rawUrl !== 'string') return;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.includes('wsrv.nl')) return;

    if (trimmed.startsWith('/')) {
      candidates.push(`${PRIMARY_TMDB_CDN}${trimmed}`);
      candidates.push(`${SECONDARY_TMDB_CDN}${trimmed}`);
      candidates.push(`${BACKUP_TMDB_CDN}${trimmed}`);
    } else if (trimmed.startsWith('http')) {
      const sanitized = sanitizeUrl(trimmed);
      if (sanitized && !candidates.includes(sanitized)) {
        candidates.push(sanitized);
        // If it's a TMDB image.tmdb.org URL, add mirrors
        if (trimmed.includes('image.tmdb.org/t/p/')) {
          const pathEnd = trimmed.split('/t/p/')[1];
          if (pathEnd) {
            const secondary = `${SECONDARY_TMDB_CDN}/${pathEnd.replace(/^w\d+\//, '')}`;
            if (!candidates.includes(secondary)) candidates.push(secondary);
            const backup = `${BACKUP_TMDB_CDN}/${pathEnd.replace(/^w\d+\//, '')}`;
            if (!candidates.includes(backup)) candidates.push(backup);
          }
        }
      }
    }
  };

  // Step-by-step priority additions
  addCandidate(item.resolvedPosterUrl);
  addCandidate(item.posterUrl);
  addCandidate(item.poster_path);
  addCandidate(item.posterPath);

  // TVMaze / OMDb Fallbacks
  if (item.image && typeof item.image === 'object') {
    addCandidate(item.image.original);
    addCandidate(item.image.medium);
  } else if (typeof item.image === 'string') {
    addCandidate(item.image);
  }

  if (item.Poster && item.Poster !== 'N/A') {
    addCandidate(item.Poster);
  }

  // Deduplicate and filter candidates
  const uniqueCandidates = Array.from(new Set(candidates));
  return uniqueCandidates.length > 0 ? uniqueCandidates : [DEFAULT_SVG_PLACEHOLDER];
}

export function getBackdropFallbackChain(
  item: MediaCatalogItem | null | undefined
): string[] {
  if (!item) return [DEFAULT_SVG_PLACEHOLDER];

  const candidates: string[] = [];

  const addCandidate = (rawUrl: string | null | undefined) => {
    if (!rawUrl || typeof rawUrl !== 'string') return;
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.includes('wsrv.nl')) return;

    if (trimmed.startsWith('/')) {
      candidates.push(`${PRIMARY_BACKDROP_CDN}${trimmed}`);
      candidates.push(`${SECONDARY_BACKDROP_CDN}${trimmed}`);
      candidates.push(`${BACKUP_BACKDROP_CDN}${trimmed}`);
    } else if (trimmed.startsWith('http')) {
      const sanitized = sanitizeUrl(trimmed);
      if (sanitized && !candidates.includes(sanitized)) {
        candidates.push(sanitized);
      }
    }
  };

  addCandidate(item.resolvedBackdropUrl);
  addCandidate(item.backdropUrl);
  addCandidate(item.backdrop_path);
  addCandidate(item.backdropPath);

  // Fallback to poster if no backdrop exists
  if (candidates.length === 0) {
    return getPosterFallbackChain(item);
  }

  const uniqueCandidates = Array.from(new Set(candidates));
  return uniqueCandidates.length > 0 ? uniqueCandidates : [DEFAULT_SVG_PLACEHOLDER];
}

export function resolvePoster(
  item: MediaCatalogItem | null | undefined
): string | null {
  const chain = getPosterFallbackChain(item);
  return chain[0] || null;
}

export function resolveBackdrop(
  item: MediaCatalogItem | null | undefined
): string | null {
  const chain = getBackdropFallbackChain(item);
  return chain[0] || null;
}

export function debugPosterResolution(
  item: MediaCatalogItem,
  context = 'CARD_RENDER'
) {
  if (process.env.NODE_ENV !== 'development') return;
  const resolved = resolvePoster(item);
  if (!resolved) {
    console.group(
      `🚨 [POSTER DEBUG MISS] Context: ${context} | Title: "${
        item.title || item.name || 'Unknown'
      }"`
    );
    console.log('poster_path:', item.poster_path);
    console.log('posterPath:', item.posterPath);
    console.log('posterUrl:', item.posterUrl);
    console.log('resolvedPosterUrl:', item.resolvedPosterUrl);
    console.log('image:', item.image);
    console.log('Poster:', item.Poster);
    console.log('Resolved Output:', resolved);
    console.groupEnd();
  }
}
