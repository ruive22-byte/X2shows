export type NavTab = 'Home' | 'TV' | 'Movies' | 'Anime' | 'Toons' | 'Originals' | 'Trending' | 'Watchlist' | 'Newly Added';

export type CategoryPill = 
  | 'For You'
  | 'Top 10'
  | 'Cause You Like'
  | 'Explore More' | 'Newly Added';

export type AspectRatioMode = '2:3' | '16:9';

export type ShimmerSpeed = 'normal' | 'fast' | 'pulse' | 'neon';

export type GridDensity = 'standard' | 'compact' | 'cinema';

export type WatchlistStatus = 'Watching' | 'Planned' | 'Finished' | 'Dropped';

export interface SkeletonCardItem {
  tmdbId?: string | number;
  imdbId?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  resolvedPosterUrl?: string | null;
  resolvedBackdropUrl?: string | null;
  mediaType?: string;
  id: string;
  category: CategoryPill;
  navType: NavTab;
  aspectRatio?: AspectRatioMode;
  matchScore: number;
  durationMinutes: number;
  qualityBadges: string[];
  trendingRank?: number;
  genreTags: string[];
  isFeatured?: boolean;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  studio?: string;
  franchiseId?: string;
  franchise_id?: number;
  imdb_id?: string;
}

/**
 * Standardized Internal Show Schema across all 3 APIs (TMDB, TVmaze, OMDb, Fallback)
 */
export interface ShowData {
  id: string; // Internal unique ID
  tmdbId?: number;
  tvmazeId?: number;
  imdbId?: string;
  title: string;
  name?: string;
  franchiseId?: string; // Strict identifier (e.g., "franchise-ben-10" or "franchise-spiderman")
  franchise_id?: number; // Strict numerical identifier (e.g., 8945 or 569094)
  posterUrl: string | null;
  resolvedPosterUrl?: string | null;
  poster_path?: string | null;
  posterPath?: string | null;
  backdropUrl: string | null;
  source: 'TMDB' | 'TVMAZE' | 'OMDB' | 'FALLBACK' | 'placeholder';
  genres?: string[];
  overview?: string;
  rating?: number;
  vote_average?: number;
  vote_count?: number;
  releaseYear?: string | number;
  media_type?: 'tv' | 'movie';
  navType?: NavTab;
  studio?: string;
  qualityBadges?: string[];
  totalEpisodes?: number;
  seasonCount?: number;
}

export interface SkeletonSection {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  isTopTen?: boolean;
  cards: SkeletonCardItem[];
  hasExploreArrow?: boolean;
  onExploreClick?: () => void;
}

export interface Character {
  id: string;
  name: string;
  japaneseName?: string;
  role?: string;
  voiceActor?: string;
  voiceActorEn?: string;
  avatarUrl?: string;
  [key: string]: any;
}

export interface SoundtrackTrack {
  id: string;
  title: string;
  composer?: string;
  artist?: string;
  type?: string;
  duration?: string;
  isFeatured?: boolean;
  [key: string]: any;
}

export interface SakugaClip {
  id: string;
  title: string;
  keyAnimator?: string;
  episodeNumber?: number;
  timecode?: string;
  tags?: string[];
  previewGifUrl?: string;
  description?: string;
  [key: string]: any;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating?: number;
  score?: number;
  comment?: string;
  content?: string;
  date?: string;
  [key: string]: any;
}

export interface Episode {
  id?: string;
  number: number;
  season?: number;
  title: string;
  japaneseTitle?: string;
  duration?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  synopsis?: string;
  airDate?: string;
  isKeySakugaEpisode?: boolean;
  animatorHighlight?: string;
  [key: string]: any;
}

export interface Show {
  id: string;
  title: string;
  japaneseTitle?: string;
  romajiTitle?: string;
  type?: 'Series' | 'Movie' | 'OVA' | string;
  category?: 'series' | 'movie' | string;
  studio?: string;
  director?: string;
  episodesCount?: number;
  seasonsCount?: number;
  seasonCount?: number;
  releaseYear?: number;
  rating?: string;
  maturityRating?: string;
  score?: number;
  matchPercentage?: number;
  trendingRank?: number;
  featured?: boolean;
  isSpotlight?: boolean;
  heroBannerUrl?: string;
  posterUrl?: string;
  trailerUrl?: string;
  audioChannels?: string[];
  qualityBadges?: string[];
  animationStyle?: string;
  synopsis?: string;
  genres?: string[];
  tags?: string[];
  episodes?: Episode[];
  characters?: Character[];
  soundtracks?: SoundtrackTrack[];
  sakugaHighlights?: SakugaClip[];
  reviews?: Review[];
  technicalSpecs?: {
    aspectRatio?: string;
    codec?: string;
    framerate?: string;
    audio?: string;
    colorSpace?: string;
  };
  similarShowIds?: string[];
  franchiseId?: string;
  franchise_id?: number;
  imdb_id?: string;
  [key: string]: any;
}

export interface ContinueWatchingShow {
  id: string;
  showId: string;
  title: string;
  japaneseTitle?: string;
  currentEpisode: number;
  totalEpisodes: number;
  season?: number;
  episodeTitle?: string;
  durationMinutes: number;
  remainingMinutes: number;
  progressPercent: number;
  posterUrl: string | null;
  resolvedPosterUrl?: string | null;
  poster_path?: string | null;
  posterPath?: string | null;
  backdropUrl: string | null;
  genres: string[];
  studio?: string;
  qualityBadge?: string;
  matchScore?: number;
  sakugaHighlight?: string;
  lastWatchedAt?: string;
  [key: string]: any;
}

export interface WatchlistItem {
  id: string;
  showId: string;
  title: string;
  japaneseTitle?: string;
  status: WatchlistStatus;
  releaseYear: number;
  genres: string[];
  studio?: string;
  score?: number;
  userRating?: number;
  matchScore?: number;
  episodesWatched: number;
  totalEpisodes: number;
  durationMinutes?: number;
  progressPercent: number;
  posterUrl: string | null;
  resolvedPosterUrl?: string | null;
  poster_path?: string | null;
  posterPath?: string | null;
  heroPosterUrl?: string;
  backdropUrl?: string;
  synopsis?: string;
  qualityBadges?: string[];
  addedAt?: string;
  notes?: string;
  category?: string;
  format?: string;
  [key: string]: any;
}
