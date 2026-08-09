import { TMDB_ANIMATED_CATALOG, TmdbAnimatedShow } from '../data/tmdbData';
import { CatalogIndex } from './catalogIndex';
import { hydrateCatalogMetadata } from './catalogHydrator';

export const globalCatalogIndex = new CatalogIndex(TMDB_ANIMATED_CATALOG);

export async function initializeCatalog() {
  const rawCatalog = globalCatalogIndex.getAll();
  const hydrated = await hydrateCatalogMetadata(rawCatalog);
  globalCatalogIndex.rebuild(hydrated);
  return globalCatalogIndex.getAll();
}
