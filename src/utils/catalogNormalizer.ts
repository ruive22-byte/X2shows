import { TmdbAnimatedShow } from '../data/tmdbData';

// Known collection mapping for automatic franchise binding
const KNOWN_COLLECTIONS: Record<string, number> = {
  'spider-man': 573436,
  'spider-verse': 573436,
  'batman': 131635,
  'toy story': 86026,
  'shrek': 2150,
  'despicable me': 86066,
  'kung fu panda': 77816,
  'how to train your dragon': 85805,
};

export class CatalogNormalizer {
  /**
   * Always fetch maximum resolution artwork for 4K display targets
   */
  public static getImageUrl(path?: string | null, size: 'w500' | 'w780' | 'original' = 'w780'): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  /**
   * Detects and assigns collection_id based on show title or keywords.
   */
  public static inferCollectionId(title: string, existingId?: number): number | undefined {
    if (existingId) return existingId;
    const lower = title.toLowerCase();
    for (const [keyword, collectionId] of Object.entries(KNOWN_COLLECTIONS)) {
      if (lower.includes(keyword)) return collectionId;
    }
    return undefined;
  }

  /**
   * Takes a raw or partial show entry and returns a complete, fully hydrated TmdbAnimatedShow.
   */
  public static normalizeShow(raw: Partial<TmdbAnimatedShow>): TmdbAnimatedShow {
    const title = raw.title || raw.name || 'Untitled Animated Media';
    const mediaType = raw.media_type || raw.mediaType || (raw.seasonCount ? 'tv' : 'movie');
    const tmdbId = raw.tmdbId || (raw.id ? parseInt(raw.id.replace(/\D/g, ''), 10) : 999999);
    const id = raw.id || `tmdb-${mediaType}-${tmdbId}`;

    const posterPath = raw.poster_path || (raw.posterUrl ? raw.posterUrl.replace('https://image.tmdb.org/t/p/w500', '') : null);
    const backdropPath = raw.backdrop_path || (raw.backdropUrl ? raw.backdropUrl.replace('https://image.tmdb.org/t/p/original', '') : null);

    const fullPosterUrl = raw.posterUrl || this.getImageUrl(posterPath, 'w500') || undefined;
    const fullBackdropUrl = raw.backdropUrl || this.getImageUrl(backdropPath, 'original') || undefined;

    return {
      id,
      tmdbId,
      collection_id: this.inferCollectionId(title, raw.collection_id),
      title,
      name: title,
      original_name: raw.original_name || title,
      poster_path: posterPath || undefined,
      backdrop_path: backdropPath || undefined,
      posterUrl: fullPosterUrl,
      resolvedPosterUrl: raw.resolvedPosterUrl || fullPosterUrl,
      backdropUrl: fullBackdropUrl,
      resolvedBackdropUrl: raw.resolvedBackdropUrl || fullBackdropUrl,
      overview: raw.overview || 'An extraordinary animated story available to stream.',
      vote_average: raw.vote_average || 8.0,
      vote_count: raw.vote_count || 1000,
      first_air_date: raw.first_air_date || raw.release_date || '2024-01-01',
      release_date: raw.release_date || raw.first_air_date || '2024-01-01',
      genres: raw.genres && raw.genres.length > 0 ? raw.genres : ['Animation', 'Action', 'Adventure'],
      genre_ids: raw.genre_ids || [16],
      media_type: mediaType as 'tv' | 'movie',
      mediaType: mediaType as 'tv' | 'movie',
      navType: raw.navType || (mediaType === 'tv' ? 'TV' : 'Movies'),
      category: raw.category || 'Newly Added',
      seasonCount: raw.seasonCount || (mediaType === 'tv' ? 1 : undefined),
      totalEpisodes: raw.totalEpisodes || (mediaType === 'tv' ? 12 : undefined),
      durationMinutes: raw.durationMinutes || (mediaType === 'movie' ? 110 : undefined),
      studio: raw.studio || 'Animation Studios',
      qualityBadges: raw.qualityBadges || ['4K UHD', 'HDR10', '5.1 Audio'],
      matchScore: raw.matchScore || Math.min(99, Math.round((raw.vote_average || 8.0) * 10)),
      tagline: raw.tagline || '',
      isNewlyAdded: raw.isNewlyAdded !== undefined ? raw.isNewlyAdded : true,
    };
  }

  /**
   * Normalizes an entire array of catalog items at once.
   */
  public static normalizeCatalog(catalog: Partial<TmdbAnimatedShow>[]): TmdbAnimatedShow[] {
    return catalog.map((item) => this.normalizeShow(item));
  }
}
