import { TmdbAnimatedShow } from '../../data/tmdbData';

export class ImageResolver {
  public static getEpisodeImage(
    show: TmdbAnimatedShow,
    seasonNumber: number,
    episodeNumber: number,
    episodeStillUrl?: string | null
  ): string {
    // 1. Episode still if available and safe
    if (episodeStillUrl) {
      if (episodeStillUrl.startsWith('http')) return episodeStillUrl;
      return `https://image.tmdb.org/t/p/w1280${episodeStillUrl}`;
    }

    // 2. Fallback to show artwork to ensure no unrelated show's art is used
    if (show.backdropUrl) {
      return show.backdropUrl;
    }
    
    if (show.posterUrl) {
      return show.posterUrl;
    }

    // 3. Safe Placeholder
    return 'https://via.placeholder.com/1280x720.png?text=No+Image+Available';
  }
}
