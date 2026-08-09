import { TmdbAnimatedShow } from '../data/tmdbData';

export class CatalogSanitizer {
  public static sanitizeCatalog(shows: TmdbAnimatedShow[]): TmdbAnimatedShow[] {
    const seenIds = new Set<string | number>();
    const seenTitles = new Set<string>();

    return shows
      .filter((show) => {
        if (!show) return false;
        const id = show.tmdbId || show.id;
        const titleKey = (show.title || show.name || '').toLowerCase().trim();

        // Skip nameless entries, duplicate IDs, or duplicate titles
        if (!titleKey || (id && seenIds.has(id)) || seenTitles.has(titleKey)) {
          return false;
        }

        if (id) seenIds.add(id);
        seenTitles.add(titleKey);
        return true;
      })
      .map((show) => {
        const id = show.tmdbId || show.id;
        // Inject fallback poster if missing
        const posterUrl =
          show.posterUrl ||
          show.poster_path ||
          show.resolvedPosterUrl ||
          `https://image.tmdb.org/t/p/w500/${id}.jpg`;

        return {
          ...show,
          posterUrl,
          resolvedPosterUrl: show.resolvedPosterUrl || posterUrl,
        };
      });
  }
}
