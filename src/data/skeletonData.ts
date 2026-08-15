import { resolvePoster, resolveBackdrop } from '../utils/posterResolver';
import { SkeletonSection, SkeletonCardItem, CategoryPill } from '../types';
import { TMDB_ANIMATED_CATALOG, TmdbAnimatedShow } from './tmdbData';

export const CATEGORY_PILLS: CategoryPill[] = [
  'Newly Added',
  'For You',
  'Top 10',
  'Cause You Like',
  'Explore More'
];

// Map verified authentic TMDB items to sections
export const INITIAL_SECTIONS: SkeletonSection[] = [
  {
    id: 'newly-added',
    title: 'Newly Added',
    subtitle: 'Freshly requested animated blockbusters, Spider-Verse masterworks, classic series, and newly added TMDB features',
    badge: 'NEWLY ADDED',
    isTopTen: false,
    cards: [
      ...TMDB_ANIMATED_CATALOG.filter(item => item.isNewlyAdded || item.category === 'Newly Added').slice().reverse(),
      ...TMDB_ANIMATED_CATALOG.filter(item => !item.isNewlyAdded && item.category !== 'Newly Added')
    ].slice(0, 30).map(item => ({
      id: item.id,
      tmdbId: item.tmdbId,
      imdbId: item.imdbId,
      category: 'Newly Added',
      navType: item.navType,
      matchScore: item.matchScore || 99,
      durationMinutes: item.durationMinutes || 24,
      qualityBadges: item.qualityBadges || ['NEW', '4K UHD', 'HDR10'],
      genreTags: item.genres || ['Animation', 'Action'],
      isFeatured: item.isFeatured,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      posterUrl: item.posterUrl,
      resolvedPosterUrl: item.resolvedPosterUrl,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average,
      studio: item.studio
    }))
  },
  {
    id: 'for-you',
    title: 'For You',
    subtitle: 'Hand-picked TMDB animated masterworks, high-octane sakuga, and cozy cartoon favorites',
    badge: 'FOR YOU',
    isTopTen: false,
    cards: [...TMDB_ANIMATED_CATALOG.filter(item => item.category === 'For You' || item.category === 'Newly Added')].reverse().map(item => ({
      id: item.id,
      tmdbId: item.tmdbId,
      imdbId: item.imdbId,
      category: 'For You',
      navType: item.navType,
      matchScore: item.matchScore || 98,
      durationMinutes: item.durationMinutes || 24,
      qualityBadges: item.qualityBadges || ['4K UHD', 'TEAL HDR'],
      genreTags: item.genres || ['Animation', 'Action'],
      isFeatured: item.isFeatured,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      posterUrl: item.posterUrl,
      resolvedPosterUrl: item.resolvedPosterUrl,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average,
      studio: item.studio
    }))
  },
  {
    id: 'top-10',
    title: 'Top 10',
    subtitle: 'The 10 most viral cartoon hits and top-streamed animation blockbusters lighting up TMDB today',
    badge: 'TOP 10',
    isTopTen: true,
    cards: TMDB_ANIMATED_CATALOG.filter(item => item.category === 'Top 10' || (item.trendingRank && item.trendingRank <= 6)).slice(0, 6).map((item, idx) => ({
      id: item.id,
      category: 'Top 10',
      navType: item.navType,
      trendingRank: idx + 1,
      matchScore: item.matchScore || 98,
      durationMinutes: item.durationMinutes || 24,
      qualityBadges: item.qualityBadges || ['4K UHD', 'DOLBY ATMOS'],
      genreTags: item.genres || ['Action', 'Fantasy'],
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average,
      studio: item.studio
    }))
  },
  {
    id: 'cause-you-like',
    title: 'Cause You Like',
    subtitle: 'Because you streamed and loved high-energy sakuga, fantasy adventures, and dark storytelling',
    badge: 'CAUSE YOU LIKE',
    isTopTen: false,
    cards: TMDB_ANIMATED_CATALOG.filter(item => item.category === 'Cause You Like').map(item => ({
      id: item.id,
      category: 'Cause You Like',
      navType: item.navType,
      matchScore: item.matchScore || 97,
      durationMinutes: item.durationMinutes || 24,
      qualityBadges: item.qualityBadges || ['4K UHD', '120 FPS'],
      genreTags: item.genres || ['Dark Fantasy', 'Animation'],
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average,
      studio: item.studio
    }))
  },
  {
    id: 'explore-more',
    title: 'Explore More',
    subtitle: 'Venture deeper into classic Ghibli masterworks, legendary shonen journeys, and indie treasures',
    badge: 'EXPLORE MORE',
    isTopTen: false,
    cards: TMDB_ANIMATED_CATALOG.filter(item => item.category === 'Explore More').map(item => ({
      id: item.id,
      category: 'Explore More',
      navType: item.navType,
      matchScore: item.matchScore || 96,
      durationMinutes: item.durationMinutes || 24,
      qualityBadges: item.qualityBadges || ['4K MASTER', 'ATMOS'],
      genreTags: item.genres || ['Adventure', 'Animation'],
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average,
      studio: item.studio
    }))
  }
];



export function transformTmdbShowToSkeletonCard(
  item: TmdbAnimatedShow,
  category: CategoryPill = 'For You',
  rank?: number
): SkeletonCardItem {
  const baseItem = {
    id: item.id,
    category: category,
    navType: item.navType,
    trendingRank: rank,
    matchScore: item.matchScore || Math.min(99, Math.max(70, Math.round((item.vote_average || 8.5) * 10))),
    durationMinutes: item.durationMinutes || (item.media_type === 'movie' ? 110 : 24),
    qualityBadges: item.qualityBadges || ['4K UHD', 'DOLBY ATMOS'],
    genreTags: item.genres || ['Animation', 'Action'],
    isFeatured: item.isFeatured,
    title: item.title,
    name: item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    posterUrl: item.posterUrl || item.resolvedPosterUrl || resolvePoster(item as any),
    backdropUrl: item.backdropUrl || item.resolvedBackdropUrl || resolveBackdrop(item as any),
    overview: item.overview,
    vote_average: item.vote_average,
    studio: item.studio
  };
  return baseItem as SkeletonCardItem;
}
