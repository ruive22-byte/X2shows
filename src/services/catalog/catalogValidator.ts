import { CatalogItem } from '../../types/catalog';
import { sanitizeString } from '../security/privacyShield';

export function validateAndSanitizeItem(rawInput: any): CatalogItem | null {
  if (!rawInput || typeof rawInput !== 'object') return null;
  
  // Need either tmdbId, id, title or name to be considered a valid record
  if (!rawInput.id && !rawInput.tmdbId && !rawInput.title && !rawInput.name) {
    return null;
  }

  // Ensure an ID exists
  const id = rawInput.id || String(rawInput.tmdbId || rawInput.imdbId || Math.random().toString(36).substr(2, 9));
  const tmdbId = rawInput.tmdbId || (rawInput.id && !isNaN(Number(rawInput.id)) ? Number(rawInput.id) : undefined);
  
  const sanitized: CatalogItem = {
    ...rawInput,
    id: String(id),
    tmdbId,
    title: sanitizeString(rawInput.title || rawInput.name || ''),
    name: sanitizeString(rawInput.name || rawInput.title || ''),
    overview: sanitizeString(rawInput.overview || ''),
    original_title: sanitizeString(rawInput.original_title || rawInput.title || ''),
    original_name: sanitizeString(rawInput.original_name || rawInput.name || ''),
    studio: sanitizeString(rawInput.studio || ''),
    mediaType: rawInput.mediaType || rawInput.media_type || (rawInput.name ? 'tv' : 'movie'),
    genres: Array.isArray(rawInput.genres) ? rawInput.genres.map((g: any) => sanitizeString(String(g))) : [],
    qualityBadges: Array.isArray(rawInput.qualityBadges) ? rawInput.qualityBadges.map((b: any) => sanitizeString(String(b))) : [],
    genreTags: Array.isArray(rawInput.genreTags) ? rawInput.genreTags.map((t: any) => sanitizeString(String(t))) : [],
    // Preserve exact poster paths
    poster_path: rawInput.poster_path,
    posterPath: rawInput.posterPath,
    posterUrl: rawInput.posterUrl,
    resolvedPosterUrl: rawInput.resolvedPosterUrl,
    backdrop_path: rawInput.backdrop_path,
    backdropUrl: rawInput.backdropUrl,
    resolvedBackdropUrl: rawInput.resolvedBackdropUrl,
    image: rawInput.image,
    Poster: rawInput.Poster,
  };

  return sanitized;
}
