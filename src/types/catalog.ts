import { TmdbAnimatedShow } from '../data/tmdbData';

export type MediaType = 'tv' | 'movie' | 'anime';

export interface WatchProviderInfo {
  providerId: number;
  providerName: string;
  logoPath: string;
}

export interface WatchProvidersData {
  link?: string;
  flatrate?: WatchProviderInfo[];
  rent?: WatchProviderInfo[];
  buy?: WatchProviderInfo[];
}

export interface CatalogItem extends TmdbAnimatedShow {
  mediaType?: MediaType | 'tv' | 'movie' | string;
  genreTags?: string[];
  qualityBadges?: string[];
  watchProviders?: WatchProvidersData;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
}
