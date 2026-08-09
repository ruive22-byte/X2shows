import { TmdbAnimatedShow } from '../data/tmdbData';
import { CatalogIndex } from './catalogIndex';
import { resolvePoster } from './posterResolver';

const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || '4f298a53e5522830c95f789f05e9d60e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
        const res = await fetch(`${TMDB_BASE_URL}/${item.media_type}/${item.tmdbId}?api_key=${TMDB_API_KEY}`);
        if (res.ok) {
          apiData = await res.json();
          apiCache.set(cacheKey, apiData);
        }
      } catch (err) {
        console.warn(`[Hydrator] Failed to fetch TMDB data for ${cacheKey}`, err);
      }
    }

    if (apiData) {
      // Merge while preferring local fields over TMDB fields
      const hydrated = {
        ...item,
        title: item.title || apiData.title || apiData.name,
        name: item.name || apiData.name || apiData.title,
        overview: item.overview || apiData.overview,
        poster_path: item.poster_path || apiData.poster_path,
        backdrop_path: item.backdrop_path || apiData.backdrop_path,
        release_date: item.release_date || apiData.release_date || apiData.first_air_date,
        first_air_date: item.first_air_date || apiData.first_air_date || apiData.release_date,
        vote_average: item.vote_average || apiData.vote_average,
        vote_count: item.vote_count || apiData.vote_count,
        imdbId: item.imdbId || apiData.imdb_id,
        genres: item.genres && item.genres.length > 0 ? item.genres : (apiData.genres || []).map((g: any) => g.name),
        belongs_to_collection: item.belongs_to_collection || apiData.belongs_to_collection,
      };
      return hydrated;
    }

    return item;
  });

  return Promise.all(promises);
}
