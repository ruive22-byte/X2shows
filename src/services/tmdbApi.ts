import { TmdbAnimatedShow, TMDB_ANIMATED_CATALOG } from '../data/tmdbData';
import { globalCatalogIndex } from '../utils/globalCatalog';
import { resolvePoster } from '../utils/posterResolver';
import { normalizeCatalogItem } from '../utils/normalizer';

// API Key can be set via env or fallback to open access
const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || '4f298a53e5522830c95f789f05e9d60e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface RawTmdbMedia {
  id: number;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids: number[];
  popularity?: number;
  origin_country?: string[];
  original_language?: string;
}

// Map TMDB genre IDs to human-readable animation tags
const GENRE_MAP: Record<number, string> = {
  16: 'Animation',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
  18: 'Drama',
  35: 'Comedy',
  14: 'Fantasy',
  878: 'Sci-Fi',
  28: 'Action',
  12: 'Adventure',
  9648: 'Mystery',
  10751: 'Family',
  10402: 'Music',
  80: 'Crime',
  10768: 'War & Politics',
  27: 'Horror',
};

/**
 * Deduplicate media items by ID using the exact required formula:
 * Array.from(new Set([...existingShows, ...newShows].map(s => s.id))).map(id => combined.find(s => s.id === id));
 */
export function deduplicateShows<T extends { id: string | number }>(existingShows: T[], newShows: T[]): T[] {
  const combined = [...existingShows, ...newShows];
  const uniqueIds = Array.from(new Set(combined.map(s => s.id)));
  return uniqueIds.map(id => combined.find(s => s.id === id)!);
}

/**
 * Transform raw TMDB TV or Movie media into standard TmdbAnimatedShow
 * Strictly following rules:
 * - relative poster_path: /path.jpg
 * - relative backdrop_path: /path.jpg
 * - TV uses item.name, Movie uses item.title
 */
export async function transformRawTmdbMedia(raw: RawTmdbMedia, mediaType: 'tv' | 'movie', pageIndex: number = 1): Promise<TmdbAnimatedShow> {
  const isTv = mediaType === 'tv';
  const displayTitle = (isTv ? raw.name : raw.title) || (isTv ? raw.original_name : raw.original_title) || 'Animated Title';
  const releaseDate = raw.first_air_date || raw.release_date || '2024';
  const genres = (raw.genre_ids || []).map(gid => GENRE_MAP[gid]).filter(Boolean);
  if (genres.length === 0) genres.push('Animation', isTv ? 'Anime Series' : 'Animated Feature');

  const matchScore = Math.min(99, Math.max(85, Math.round((raw.vote_average || 8.0) * 10) + Math.floor(Math.random() * 3)));
  
  
  const resolvedPosterUrl = resolvePoster(raw as any);
  
  
  const baseItem = {
    id: `tmdb-${mediaType}-${raw.id}`,
    tmdbId: raw.id,
    title: displayTitle,
    name: isTv ? raw.name : undefined,
    original_title: !isTv ? raw.original_title : undefined,
    original_name: isTv ? raw.original_name : undefined,
    poster_path: raw.poster_path, // Standard TMDB relative path e.g. /abc.jpg
    resolvedPosterUrl: resolvedPosterUrl,
    posterUrl: resolvedPosterUrl || raw.poster_path,
    backdrop_path: raw.backdrop_path, // Standard TMDB relative path e.g. /xyz.jpg
    overview: raw.overview || `An extraordinary ${isTv ? 'animated series' : 'animated feature'} crafted with dynamic frame rate shifts, stunning character design, and rich world-building.`,
    vote_average: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 8.5,
    vote_count: raw.vote_count || 1200,
    first_air_date: raw.first_air_date,
    release_date: raw.release_date,
    genres: genres.length > 0 ? genres : ['Animation', 'Action', 'Sci-Fi'],
    genre_ids: raw.genre_ids || [16],
    media_type: mediaType,
    navType: isTv ? 'TV' : 'Movies',
    category: pageIndex % 4 === 0 ? 'Top 10' : pageIndex % 3 === 0 ? 'Cause You Like' : pageIndex % 2 === 0 ? 'Explore More' : 'For You',
    durationMinutes: isTv ? 24 : 110,
    totalEpisodes: isTv ? (raw.vote_count > 2000 ? 24 : 12) : 1,
    seasonCount: isTv ? (raw.vote_count > 3000 ? 3 : 1) : 1,
    studio: 'Sakuga Studios',
    qualityBadges: ['4K UHD', '120 FPS SAKUGA', 'DOLBY ATMOS'],
    trendingRank: Math.floor(Math.random() * 20) + 1,
    isFeatured: raw.vote_average > 8.4,
    matchScore: matchScore,
    tagline: `Experience ${displayTitle} in full 4K HDR fidelity.`,
    audioLanguages: ['English [Original]', 'Japanese [Atmos]', 'Spanish', 'French'],
    subtitles: ['English [CC]', 'Japanese', 'Spanish', 'German', 'Portuguese'],
  };
  return (await normalizeCatalogItem(baseItem)) as TmdbAnimatedShow;
}

/**
 * Fetch Animated TV Shows via TMDB Discover API:
 * https://api.themoviedb.org/3/discover/tv?api_key=${KEY}&with_genres=16&sort_by=popularity.desc&page=${page}
 */
export async function fetchAnimatedTvShows(page: number = 1): Promise<{ shows: TmdbAnimatedShow[]; totalPages: number; page: number }> {
  try {
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&page=${page}&include_null_first_air_dates=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB HTTP error ${res.status}`);
    const data: TmdbApiResponse<RawTmdbMedia> = await res.json();
    const shows = await Promise.all((data.results || []).map(r => transformRawTmdbMedia(r, 'tv', page)));
    return {
      shows,
      totalPages: data.total_pages || 50,
      page: data.page || page,
    };
  } catch (err) {
    console.warn('[TMDB API] Falling back to offline curated TV animation catalog:', err);
    // Offline catalog page slicing
    const pageSize = 20;
    const tvCatalog = globalCatalogIndex.getAll().filter(s => s.media_type === 'tv');
    const start = ((page - 1) * pageSize) % tvCatalog.length;
    const sliced = tvCatalog.slice(start, start + pageSize);
    return {
      shows: sliced.length > 0 ? sliced : tvCatalog.slice(0, 20),
      totalPages: Math.ceil(tvCatalog.length / pageSize) || 5,
      page,
    };
  }
}

/**
 * Fetch Animated Movies via TMDB Discover API:
 * https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_genres=16&sort_by=popularity.desc&page=${page}
 */
export async function fetchAnimatedMovies(page: number = 1): Promise<{ shows: TmdbAnimatedShow[]; totalPages: number; page: number }> {
  try {
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&sort_by=popularity.desc&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB HTTP error ${res.status}`);
    const data: TmdbApiResponse<RawTmdbMedia> = await res.json();
    const shows = await Promise.all((data.results || []).map(r => transformRawTmdbMedia(r, 'movie', page)));
    return {
      shows,
      totalPages: data.total_pages || 50,
      page: data.page || page,
    };
  } catch (err) {
    console.warn('[TMDB API] Falling back to offline curated Movie animation catalog:', err);
    const pageSize = 20;
    const movieCatalog = globalCatalogIndex.getAll().filter(s => s.media_type === 'movie');
    const start = ((page - 1) * pageSize) % (movieCatalog.length || 1);
    const sliced = movieCatalog.slice(start, start + pageSize);
    return {
      shows: sliced.length > 0 ? sliced : movieCatalog.slice(0, 20),
      totalPages: Math.ceil(movieCatalog.length / pageSize) || 5,
      page,
    };
  }
}

/**
 * Detailed Franchise / Saga / Universe Chronology Model
 */
export interface FranchiseItem {
  posterUrl?: string | null;
  backdropUrl?: string | null;
  id: string;
  tmdbId?: number;
  title: string;
  year: number | string;
  roleInUniverse: string; // e.g. "Original Series", "Sequel Era", "Climax Feature", "Spin-Off"
  poster_path: string | null;
  backdrop_path: string | null;
  rating: number;
  episodesCount?: number;
  overview: string;
  genres: string[];
  qualityBadge?: string;
}

export interface FranchiseCollection {
  universeName: string;
  tagline: string;
  totalEntries: number;
  items: FranchiseItem[];
}

/**
 * Authentic Franchise & Universe Generator
 * For shows like Ben 10, Arcane, Avatar, Spider-Verse, Dragon Ball, Batman, Cyberpunk, Adventure Time, etc.
 * scrolling down displays the complete chronological franchise collection!
 */


import { getRelatedShows } from '../utils/relatedResolver';

export async function getFranchiseCollection(
  show: import('../data/tmdbData').TmdbAnimatedShow,
): Promise<FranchiseCollection | null> {
  const catalogPool = globalCatalogIndex.getAll().length > 0 ? globalCatalogIndex.getAll() : TMDB_ANIMATED_CATALOG;
  const related = getRelatedShows(show, catalogPool);

  const cid = show.collection_id || show.belongs_to_collection?.id;
  const fid = show.franchiseId;
  if (cid || fid) {
    const extraMatches = catalogPool.filter(s => {
      if (s.id === show.id || s.tmdbId === show.tmdbId) return false;
      if (cid && (s.collection_id === cid || s.belongs_to_collection?.id === cid)) return true;
      if (fid && s.franchiseId === fid) return true;
      return false;
    });
    for (const match of extraMatches) {
      if (!related.find(r => r.id === match.id || (r.tmdbId && r.tmdbId === match.tmdbId))) {
        related.push(match);
      }
    }
  }

  let collectionId = cid;

  // Attempt to search TMDB for collection if not directly linked but is a movie
  if (!collectionId && show.media_type === 'movie') {
    try {
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/collection?api_key=4f298a53e5522830c95f789f05e9d60e&query=${encodeURIComponent(show.title || show.name)}`);
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.results?.length > 0) {
           collectionId = data.results[0].id;
        }
      }
    } catch (e) {
      console.warn("Collection search failed", e);
    }
  }

  let items = [...related];

  if (collectionId) {
    try {
      const colRes = await fetch(`https://api.themoviedb.org/3/collection/${collectionId}?api_key=4f298a53e5522830c95f789f05e9d60e`);
      if (colRes.ok) {
        const data = await colRes.json();
        if (data && data.parts && data.parts.length > 0) {
          const tmdbItems = await Promise.all(data.parts.map(async (raw: any) => {
             return {
               id: `tmdb-movie-${raw.id}`,
               tmdbId: raw.id,
               title: raw.title || raw.name,
               overview: raw.overview,
               poster_path: raw.poster_path,
               backdrop_path: raw.backdrop_path,
               posterUrl: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : undefined,
               backdropUrl: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : undefined,
               media_type: 'movie',
               vote_average: raw.vote_average,
               release_date: raw.release_date
             } as import('../data/tmdbData').TmdbAnimatedShow;
          }));

          for (const item of tmdbItems) {
            if (!items.find(i => i.tmdbId === item.tmdbId) && item.tmdbId !== show.tmdbId) {
              items.push(item);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Collection fetch failed", e);
    }
  }

  if (items.length > 0) {
    const allEntries = [show, ...items].sort((a, b) => {
      const yearA = parseInt(a.release_date || a.first_air_date || '2000');
      const yearB = parseInt(b.release_date || b.first_air_date || '2000');
      return yearA - yearB;
    });

    const rootName = (show.franchiseId || show.title || show.name || '').split(':')[0].split('-')[0].trim();

    return {
      universeName: `${rootName} Universe`,
      tagline: `Explore the complete ${rootName} collection`,
      totalEntries: allEntries.length,
      items: allEntries.map((m, idx) => {
         const poster = m.posterUrl || m.resolvedPosterUrl || (m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`) : undefined);
         const backdrop = m.backdropUrl || m.resolvedBackdropUrl || (m.backdrop_path ? (m.backdrop_path.startsWith('http') ? m.backdrop_path : `https://image.tmdb.org/t/p/original${m.backdrop_path}`) : undefined);
         return {
           id: m.id,
           tmdbId: m.tmdbId,
           title: m.title || m.name || '',
           year: m.first_air_date ? m.first_air_date.substring(0, 4) : (m.release_date ? m.release_date.substring(0, 4) : 'TBD'),
           roleInUniverse: `Entry ${idx + 1}`,
           poster_path: m.poster_path,
           backdrop_path: m.backdrop_path,
           posterUrl: poster,
           backdropUrl: backdrop,
           rating: m.vote_average || 0,
           overview: m.overview || '',
           genres: m.genres || [],
           qualityBadge: '4K UHD'
         };
      })
    };
  }

  return null;
}

export function getRelatedAndRecommendedShows(targetShow: TmdbAnimatedShow, pool: TmdbAnimatedShow[]): TmdbAnimatedShow[] {
  const targetGenres = new Set((targetShow.genres || []).map(g => g.toLowerCase()));
  const targetStudio = (targetShow.studio || '').toLowerCase();

  const getManualFranchise = (show: TmdbAnimatedShow) => {
    const t = (show.title || show.name || '').toLowerCase();
    if (t.includes('adventure time')) return 'adventure time';
    if (t.includes('ben 10')) return 'ben 10';
    if (t.includes('avatar: the last airbender') || t.includes('legend of korra')) return 'avatar';
    return null;
  };
  const targetFranchise = getManualFranchise(targetShow);

  const scored = pool
    .filter(s => {
      if (s.id === targetShow.id || s.title === targetShow.title) return false;
      if (targetFranchise && getManualFranchise(s) === targetFranchise) return false;
      return true;
    })
    .map(s => {
      let score = 0;
      // Match genres
      (s.genres || []).forEach(g => {
        if (targetGenres.has(g.toLowerCase())) score += 3;
      });
      // Match media type
      if (s.media_type === targetShow.media_type) score += 2;
      // Match high score
      if (s.vote_average >= 8.5) score += 2;
      // Studio match
      if (targetStudio && (s.studio || '').toLowerCase() === targetStudio) score += 4;
      
      return { show: s, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map(item => item.show);
}

export async function fetchTmdbDetails(tmdbId: number, type: 'tv' | 'movie', language: string = 'en-US'): Promise<any> {
  try {
    const url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(language)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return transformRawTmdbMedia(data, type, 1);
  } catch (err) {
    return null;
  }
}

import { TmdbIndexedDb } from '../utils/tmdbIndexedDb';

export class TmdbApi {
  /**
   * Fetches show details, checking IndexedDB cache first before hitting API
   */
  public static async getShowDetails(tmdbId: number | string): Promise<any> {
    const cacheKey = `tmdb_show_details_${tmdbId}`;

    // 1. Read from IndexedDB local cache
    const cachedData = await TmdbIndexedDb.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Serving show details for ID: ${tmdbId}`);
      return cachedData;
    }

    // 2. Network Fetch Fallback
    try {
      const response = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations`);
      if (!response.ok) throw new Error(`TMDB error ${response.status}`);

      const data = await response.json();

      // 3. Persist to IndexedDB for offline access
      await TmdbIndexedDb.set(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(`[TMDB API Error] Fetch failed for ${tmdbId}, fallback to cached or offline data.`);
      return null;
    }
  }

  /**
   * Fetches season episode stills & metadata with IndexedDB offline persistence
   */
  public static async getSeasonEpisodes(tmdbId: number | string, seasonNumber: number): Promise<any> {
    const cacheKey = `tmdb_season_${tmdbId}_s${seasonNumber}`;

    const cachedData = await TmdbIndexedDb.get<any>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
      if (!response.ok) throw new Error(`TMDB season fetch error`);

      const data = await response.json();
      await TmdbIndexedDb.set(cacheKey, data);
      return data;
    } catch {
      return null;
    }
  }
}

