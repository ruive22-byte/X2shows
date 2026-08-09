import { resolvePoster, resolveBackdrop } from './posterResolver';
import { getNextFallbackArtwork } from '../services/apiFallbackService';

export async function normalizeCatalogItem(rawItem: any) {
  if (!rawItem) return rawItem;
  
  let resolvedPoster = resolvePoster(rawItem);
  let resolvedBackdrop = resolveBackdrop(rawItem);

  if (!resolvedPoster || !resolvedBackdrop) {
    const title = rawItem.title || rawItem.name || rawItem.original_title || rawItem.original_name;
    if (title) {
       const fallback = await getNextFallbackArtwork(title, 'tmdb', null, rawItem.tmdbId || rawItem.id, rawItem.imdbId);
       if (fallback && fallback.url) {
         if (!resolvedPoster) resolvedPoster = fallback.url;
         if (!resolvedBackdrop) resolvedBackdrop = fallback.url;
       }
    }
  }

  return {
    ...rawItem,

    // Preserve all original provider fields.
    poster_path: rawItem.poster_path,
    posterPath: rawItem.posterPath,
    image: rawItem.image,
    Poster: rawItem.Poster,

    // Add normalized usable URLs.
    posterUrl: resolvedPoster || rawItem.posterUrl || null,
    resolvedPosterUrl: resolvedPoster,
    
    // Add backdrop fallback
    backdropUrl: resolvedBackdrop || rawItem.backdropUrl || null,
    resolvedBackdropUrl: resolvedBackdrop,
  };
}
