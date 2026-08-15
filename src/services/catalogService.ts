export interface CatalogEpisode {
  showId: string;
  season: number;
  episode: number;
  title: string;
  streamId: string;
  overview?: string;
  stillUrl?: string | null;
}

export interface CatalogSeason {
  number: number;
  episodes: CatalogEpisode[];
}

export interface ShowCatalogData {
  showId: string;
  title?: string;
  seasons: CatalogSeason[];
  cachedAt?: string;
}

export class CatalogCacheService {
  private static localCache = new Map<string, ShowCatalogData>();

  /**
   * Instantly fetches catalog metadata for a show (Seasons & Episode list) from local memory or GET /api/catalog/show/:id
   */
  public static async getShowCatalog(showId: string | number, seasonsCount = 2): Promise<ShowCatalogData> {
    const cleanId = String(showId);
    if (this.localCache.has(cleanId)) {
      return this.localCache.get(cleanId)!;
    }

    try {
      const res = await fetch(`/api/catalog/show/${cleanId}?seasons=${seasonsCount}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.seasons) {
          const catalogData: ShowCatalogData = {
            showId: cleanId,
            title: data.title,
            seasons: data.seasons,
            cachedAt: data.cachedAt
          };
          this.localCache.set(cleanId, catalogData);
          return catalogData;
        }
      }
    } catch (e) {
      console.warn(`[CatalogCacheService] Failed fetching remote catalog for show ${cleanId}, generating instant local catalog.`);
    }

    // Local fallback generation
    const seasons: CatalogSeason[] = [];
    for (let s = 1; s <= seasonsCount; s++) {
      const episodes: CatalogEpisode[] = [];
      for (let e = 1; e <= 12; e++) {
        episodes.push({
          showId: cleanId,
          season: s,
          episode: e,
          title: `Episode ${e}`,
          streamId: `${cleanId}_s${s}e${e}`
        });
      }
      seasons.push({ number: s, episodes });
    }

    const fallback: ShowCatalogData = { showId: cleanId, seasons };
    this.localCache.set(cleanId, fallback);
    return fallback;
  }
}
