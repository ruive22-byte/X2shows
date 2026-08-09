import { CatalogItem } from '../../types/catalog';

export function deduplicateCatalog(items: CatalogItem[]): CatalogItem[] {
  const seenKeys = new Set<string>();
  const deduplicated: CatalogItem[] = [];
  
  for (const item of items) {
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

    deduplicated.push(item);
  }
  
  return deduplicated;
}
