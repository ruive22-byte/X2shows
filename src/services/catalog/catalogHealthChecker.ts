import { catalogRegistry } from './catalogRegistry';

export function runCatalogHealthCheck() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const items = catalogRegistry.getAll();
  const missingPosters = items.filter(i => !i.resolvedPosterUrl && !i.poster_path && !i.posterUrl);
  const duplicates = new Map<number, number>();
  
  items.forEach(i => {
    if (i.tmdbId) {
      duplicates.set(i.tmdbId, (duplicates.get(i.tmdbId) || 0) + 1);
    }
  });
  
  const dupes = Array.from(duplicates.entries()).filter(([_, count]) => count > 1);
  
  console.group('🛠 Catalog Health Check');
  console.log(`Total Indexed Items: ${items.length}`);
  console.log(`Missing Posters: ${missingPosters.length}`, missingPosters.map(i => i.title || i.name));
  console.log(`Duplicate TMDB IDs: ${dupes.length}`, dupes);
  console.groupEnd();
}
