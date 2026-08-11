import { TmdbAnimatedShow } from '../data/tmdbData';
import { CatalogIndex } from './catalogIndex';
import { resolvePoster } from './posterResolver';

const TMDB_BASE_URL = '/api/tmdb/proxy?path=';

// Cache for API responses to avoid hitting TMDB for the same ID repeatedly
const apiCache = new Map<string, any>();

export async function hydrateCatalogMetadata(catalog: TmdbAnimatedShow[]): Promise<TmdbAnimatedShow[]> {
  const promises = catalog.map(async (item) => {
    // If it already has enough details, skip hydration
    if (item.title && item.overview && item.genres && item.genres.length > 0 && item.poster_path) {
      return item;
    }

    if (!item.tmdbId || !item.media_type) {
      return item;
    }

    const cacheKey = `${item.media_type}-${item.tmdbId}`;
    let apiData = apiCache.get(cacheKey);

    if (!apiData) {
      try {
        const url = `/api/tmdb/proxy?path=/${item.media_type}/${item.tmdbId}`;
        const res = await fetch(url);
        if (res.ok) {
          apiData = await res.json();
          apiCache.set(cacheKey, apiData);
        }
      } catch (err) {
        console.warn('Hydration fetch failed', err);
      }
    }

    if (apiData) {
      const hydrated = {
        ...item,
        title: item.title || apiData.name || apiData.title,
        overview: item.overview || apiData.overview,
        poster_path: item.poster_path || apiData.poster_path,
        backdrop_path: item.backdrop_path || apiData.backdrop_path,
        genres: item.genres && item.genres.length > 0 ? item.genres : (apiData.genres || []).map((g: any) => g.name),
        belongs_to_collection: item.belongs_to_collection || apiData.belongs_to_collection,
      };
      return hydrated;
    }

    return item;
  });

  return Promise.all(promises);
}
