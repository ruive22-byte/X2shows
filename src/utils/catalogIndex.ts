import { TmdbAnimatedShow } from '../data/tmdbData';
import { resolvePoster } from './posterResolver';

export class CatalogIndex {
  private shows: TmdbAnimatedShow[] = [];
  private byId = new Map<string, TmdbAnimatedShow>();
  private byTmdbId = new Map<number, TmdbAnimatedShow>();
  private byImdbId = new Map<string, TmdbAnimatedShow>();

  constructor(initialData: TmdbAnimatedShow[]) {
    this.rebuild(initialData);
  }

  rebuild(data: TmdbAnimatedShow[]) {
    this.shows = data.map(item => {
      // 10. Automatic ID generation if missing
      let id = item.id;
      if (!id) {
        if (item.tmdbId) {
          id = `tmdb-${item.media_type || 'unknown'}-${item.tmdbId}`;
        } else {
          id = `catalog-item-${Math.random().toString(36).substr(2, 9)}`;
        }
      }
      
      const hydratedItem = { ...item, id };
      
      // Auto-resolve poster to resolvedPosterUrl
      if (!hydratedItem.resolvedPosterUrl) {
         hydratedItem.resolvedPosterUrl = resolvePoster(hydratedItem);
      }
      
      return hydratedItem;
    });

    this.byId.clear();
    this.byTmdbId.clear();
    this.byImdbId.clear();

    this.shows.forEach(show => {
      this.byId.set(show.id, show);
      if (show.tmdbId) this.byTmdbId.set(show.tmdbId, show);
      if (show.imdbId) this.byImdbId.set(show.imdbId, show);
    });
  }

  getAll() {
    return this.shows;
  }

  getById(id: string) {
    return this.byId.get(id) || null;
  }
  
  getByTmdbId(tmdbId: number) {
    return this.byTmdbId.get(tmdbId) || null;
  }
}
