import { CatalogItem } from '../types/catalog';

export class CatalogSorter {
  /**
   * Deduplicates catalog arrays while prioritizing explicit newly added items and higher-quality metadata.
   */
  public static deduplicateShows(existing: CatalogItem[], incoming: CatalogItem[]): CatalogItem[] {
    const seenKeys = new Set<string>();
    const result: CatalogItem[] = [];

    // Combine incoming live shows and existing catalog, filtering out empty or invalid items
    const combined = [...incoming, ...existing];

    for (const item of combined) {
      if (!item) continue;
      const title = (item.title || item.name || '').trim();
      if (!title) continue;

      const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const tmdbKey = item.tmdbId ? `tmdb-${item.tmdbId}` : null;
      const idKey = item.id ? `id-${item.id}` : null;
      const titleKey = `title-${normalizedTitle}`;

      if (tmdbKey && seenKeys.has(tmdbKey)) continue;
      if (idKey && seenKeys.has(idKey)) continue;
      if (seenKeys.has(titleKey)) continue;

      if (tmdbKey) seenKeys.add(tmdbKey);
      if (idKey) seenKeys.add(idKey);
      seenKeys.add(titleKey);

      result.push(item);
    }

    return result;
  }

  /**
   * Sorts and slices catalog for "Newly Added" feeds.
   * Guarantees items with `isNewlyAdded: true` or `category: 'Newly Added'` appear at the front (Positions 0, 1, 2...).
   */
  public static getNewlyAddedSection(catalog: CatalogItem[], limit: number = 25): CatalogItem[] {
    const explicitNew = catalog.filter(
      (item) => item.isNewlyAdded === true || item.category === 'Newly Added'
    );
    
    const regularCatalog = catalog.filter(
      (item) => !item.isNewlyAdded && item.category !== 'Newly Added'
    );

    // Place explicit newly added shows first, then backfill with recent items
    const merged = [...explicitNew, ...regularCatalog.slice().reverse()];
    
    return this.deduplicateShows([], merged).slice(0, limit);
  }
}
