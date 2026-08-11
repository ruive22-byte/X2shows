import type { MediaType, SeasonIdentity, ShowIdentity } from '../domain/mediaIdentity';

export interface RawTmdbMedia {
  id: number;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  popularity?: number;
  origin_country?: string[];
  original_language?: string;
  media_type?: MediaType;
}

export interface RawTmdbEpisode {
  id?: number;
  episode_number?: number;
  season_number?: number;
  name?: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
  vote_average?: number;
  runtime?: number;
}

export interface RawTmdbSeason {
  id?: number;
  season_number?: number;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  episodes?: RawTmdbEpisode[];
}

interface TmdbApiResponse<T> {
  results?: T[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

async function request<T>(path: string): Promise<T | null> {
  const response = await fetch(path, { credentials: 'include' });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.success === false ? null : payload as T;
}

export const tmdbProvider = {
  async discover(mediaType: MediaType, page: number): Promise<TmdbApiResponse<RawTmdbMedia> | null> {
    return request<TmdbApiResponse<RawTmdbMedia>>(`/api/tmdb/discover?type=${mediaType}&page=${page}`);
  },

  async getShow(identity: ShowIdentity, language = 'en-US'): Promise<RawTmdbMedia | null> {
    return request<RawTmdbMedia>(`/api/tmdb/${identity.mediaType}/${identity.providerId}?language=${encodeURIComponent(language)}`);
  },

  async getSeason(identity: SeasonIdentity): Promise<RawTmdbSeason | null> {
    return request<RawTmdbSeason>(`/api/tmdb/tv/${identity.providerId}/season/${identity.seasonNumber}`);
  },
};
