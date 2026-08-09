import { CatalogItem, WatchProvidersData, WatchProviderInfo } from '../../types/catalog';
import { LRUCache } from './lruCache';
import { catalogStorage } from './catalogStorage';

const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || '4f298a53e5522830c95f789f05e9d60e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

const watchProvidersCache = new LRUCache<string, Promise<WatchProvidersData | null>>(300);

export async function fetchWatchProviders(
  tmdbId: number,
  mediaType: string = 'tv',
  region: string = 'US'
): Promise<WatchProvidersData | null> {
  if (!tmdbId) return null;

  const type = mediaType === 'movie' ? 'movie' : 'tv';
  const cacheKey = `watch_providers_${tmdbId}_${type}_${region}`;

  // Check LRU cache
  let pendingPromise = watchProvidersCache.get(cacheKey);
  if (pendingPromise) return pendingPromise;

  pendingPromise = (async () => {
    // Check IndexedDB storage first
    try {
      const stored = await catalogStorage.getMetadata(cacheKey);
      if (stored) return stored as WatchProvidersData;
    } catch (e) {
      // ignore
    }

    try {
      const url = `${TMDB_BASE_URL}/${type}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const data = await res.json();
      const regionData = data?.results?.[region];

      if (!regionData) return null;

      const mapProvider = (p: any): WatchProviderInfo => ({
        providerId: p.provider_id,
        providerName: p.provider_name,
        logoPath: p.logo_path ? (p.logo_path.startsWith('http') ? p.logo_path : `${TMDB_LOGO_BASE}${p.logo_path}`) : '',
      });

      const parsedData: WatchProvidersData = {
        link: regionData.link || '',
        flatrate: Array.isArray(regionData.flatrate) ? regionData.flatrate.map(mapProvider) : [],
        rent: Array.isArray(regionData.rent) ? regionData.rent.map(mapProvider) : [],
        buy: Array.isArray(regionData.buy) ? regionData.buy.map(mapProvider) : [],
      };

      // Save to storage
      await catalogStorage.saveMetadata(cacheKey, parsedData);

      return parsedData;
    } catch (err) {
      console.warn(`[WatchProviders] Fetch failed for tmdbId ${tmdbId}:`, err);
      return null;
    }
  })();

  watchProvidersCache.set(cacheKey, pendingPromise);
  return pendingPromise;
}

export async function hydrateWatchProviders(item: CatalogItem, region: string = 'US'): Promise<CatalogItem> {
  if (!item.tmdbId) return item;
  
  if (item.watchProviders) return item;

  const providers = await fetchWatchProviders(item.tmdbId, item.mediaType || 'tv', region);
  if (providers) {
    return {
      ...item,
      watchProviders: providers,
    };
  }
  return item;
}
