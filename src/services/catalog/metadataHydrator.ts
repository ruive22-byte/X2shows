import { CatalogItem } from '../../types/catalog';
import { LRUCache } from './lruCache';
import { fetchTmdbDetails } from '../tmdbApi';
import { catalogI18nResolver } from './catalogI18nResolver';

const hydrationCache = new LRUCache<string, Promise<CatalogItem | null>>(500);

export async function hydrateMetadata(item: CatalogItem, language?: string): Promise<CatalogItem> {
  const targetLanguage = language || catalogI18nResolver.getLanguage();

  if (!item.tmdbId) {
    return item;
  }
  
  const cacheKey = `hydrate_${item.tmdbId}_${item.mediaType || 'tv'}_${targetLanguage}`;
  let hydrationPromise = hydrationCache.get(cacheKey);
  
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        const details = await fetchTmdbDetails(
          item.tmdbId!, 
          item.mediaType === 'movie' ? 'movie' : 'tv',
          targetLanguage
        );
        if (details) {
          return {
            ...item,
            ...details,
            id: item.id,
            tmdbId: item.tmdbId,
            resolvedPosterUrl: item.resolvedPosterUrl || details.resolvedPosterUrl,
            resolvedBackdropUrl: item.resolvedBackdropUrl || details.resolvedBackdropUrl,
            poster_path: item.poster_path || details.poster_path,
            backdrop_path: item.backdrop_path || details.backdrop_path,
          };
        }
      } catch (e) {
        console.warn(`Failed to hydrate metadata for ${item.tmdbId} in language ${targetLanguage}`, e);
      }
      return item;
    })();
    
    hydrationCache.set(cacheKey, hydrationPromise);
  }
  
  const result = await hydrationPromise;
  return result || item;
}
