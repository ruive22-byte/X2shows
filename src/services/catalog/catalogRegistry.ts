import { CatalogItem, WatchProvidersData } from '../../types/catalog';
import { validateAndSanitizeItem } from './catalogValidator';
import { normalizeCatalogItem } from './catalogResolver';
import { deduplicateCatalog } from './catalogDeduplicator';
import { CatalogIndexer } from './catalogIndexer';
import { processInChunks } from './chunkedProcessor';
import { getFranchiseKey } from '../recommendations/franchiseResolver';
import { resolveRelatedItems } from '../recommendations/relatedResolver';
import { getRecommendations } from '../recommendations/recommendationEngine';
import { searchCatalog } from '../search/searchEngine';
import { hydrateMetadata } from './metadataHydrator';
import { catalogStorage } from './catalogStorage';
import { catalogI18nResolver, SupportedLanguage } from './catalogI18nResolver';
import { fetchWatchProviders, hydrateWatchProviders } from './watchAvailabilityHydrator';
import { deriveAutoTags } from './catalogTagResolver';
import { CatalogNormalizer } from '../../utils/catalogNormalizer';

class CatalogRegistry {
  private indexer = new CatalogIndexer();
  private isInitialized = false;

  async init(initialData: any[] = []): Promise<CatalogItem[]> {
    if (this.isInitialized) return this.getAll();

    // 1. Load locally stored catalog items instantly from IndexedDB (Zero-latency Frame 1 display)
    let storedItems: CatalogItem[] = [];
    try {
      storedItems = await catalogStorage.getItemsWithRevalidate(async (cached) => {
        // Background revalidation: update any stale items with fresh TMDB metadata
        if (cached && cached.length > 0) {
          const revalidated = await processInChunks(cached.slice(0, 15), async (item) => {
            if (!item.tmdbId) return item;
            const hydrated = await hydrateMetadata(item, catalogI18nResolver.getLanguage());
            return normalizeCatalogItem(hydrated);
          }, 3);

          if (revalidated.length > 0) {
            for (const item of revalidated) {
              this.indexer.indexItem(item, getFranchiseKey(item));
            }
            return this.getAll();
          }
        }
      });

      if (storedItems.length > 0) {
        this.indexer.clear();
        for (const item of storedItems) {
          const autoTags = deriveAutoTags(item);
          item.genreTags = Array.from(new Set([...(item.genreTags || []), ...autoTags]));
          this.indexer.indexItem(item, getFranchiseKey(item));
        }
      }
    } catch (e) {
      console.warn('[CatalogRegistry] IndexedDB load error:', e);
    }

    // 2. Process initial static data
    if (initialData && initialData.length > 0) {
      const preNormalizedData = CatalogNormalizer.normalizeCatalog(initialData);
      const validated = await processInChunks(preNormalizedData, item => validateAndSanitizeItem(item), 100);
      const validItems = validated.filter(Boolean) as CatalogItem[];
      const normalized = await processInChunks(validItems, item => normalizeCatalogItem(item), 100);
      
      // Combine stored and static normalized items
      const combined = deduplicateCatalog([...storedItems, ...normalized]);
      
      this.indexer.clear();
      for (const item of combined) {
        const autoTags = deriveAutoTags(item);
        item.genreTags = Array.from(new Set([...(item.genreTags || []), ...autoTags]));
        this.indexer.indexItem(item, getFranchiseKey(item));
      }

      // Persist in background
      catalogStorage.saveItems(combined).catch(() => {});

      // Auto-hydrate any unhydrated stubs (missing title or poster) in background
      const unhydrated = combined.filter(item => item.tmdbId && (!item.title || !item.resolvedPosterUrl || item.title === 'Animated Show'));
      if (unhydrated.length > 0) {
        processInChunks(unhydrated, async (item) => {
          const hydrated = await hydrateMetadata(item, catalogI18nResolver.getLanguage());
          const normalized = normalizeCatalogItem(hydrated);
          this.indexer.indexItem(normalized, getFranchiseKey(normalized));
          return normalized;
        }, 5).then(() => {
          catalogStorage.saveItems(this.getAll()).catch(() => {});
        }).catch(() => {});
      }
    }

    this.isInitialized = true;
    return this.getAll();
  }

  async registerItem(rawInput: any): Promise<CatalogItem | null> {
    const preNormalized = CatalogNormalizer.normalizeShow(rawInput);
    const valid = validateAndSanitizeItem(preNormalized);
    if (!valid) return null;
    
    const normalized = normalizeCatalogItem(valid);
    
    const existing = normalized.tmdbId ? this.indexer.getByTmdbId(normalized.tmdbId) : this.indexer.getById(normalized.id!);
    if (!existing) {
      this.indexer.indexItem(normalized, getFranchiseKey(normalized));
      catalogStorage.saveItems([normalized]).catch(() => {});
      return normalized;
    }
    return existing;
  }

  getAll(): CatalogItem[] { return this.indexer.getAll(); }
  
  getById(id: string): CatalogItem | undefined { return this.indexer.getById(id); }
  
  getByTmdbId(id: number): CatalogItem | undefined { return this.indexer.getByTmdbId(id); }

  search(query: string): CatalogItem[] { return searchCatalog(query, this.indexer.getAll()); }
  
  getByGenre(genre: string): CatalogItem[] { return this.indexer.getByGenre(genre); }
  
  getByStudio(studio: string): CatalogItem[] { return this.indexer.getByStudio(studio); }
  
  getByFranchise(franchiseKey: string): CatalogItem[] { return this.indexer.getByFranchise(franchiseKey); }
  
  getRelated(currentShow: CatalogItem): CatalogItem[] {
    return resolveRelatedItems(currentShow, this.indexer.getAll());
  }
  
  getRecommended(currentShow: CatalogItem, relatedShows?: CatalogItem[]): CatalogItem[] {
    const related = relatedShows || this.getRelated(currentShow);
    return getRecommendations(currentShow, this.indexer.getAll(), related);
  }

  getLanguage(): SupportedLanguage {
    return catalogI18nResolver.getLanguage();
  }

  async setLanguage(langCode: SupportedLanguage): Promise<CatalogItem[]> {
    catalogI18nResolver.setLanguage(langCode);
    const all = this.getAll();

    // Re-hydrate metadata in new language
    const rehydrated = await processInChunks(all, item => hydrateMetadata(item, langCode), 20);
    const normalized = rehydrated.map(item => normalizeCatalogItem(item));
    const deduplicated = deduplicateCatalog(normalized);

    this.indexer.clear();
    for (const item of deduplicated) {
      this.indexer.indexItem(item, getFranchiseKey(item));
    }

    catalogStorage.saveItems(deduplicated).catch(() => {});
    return this.getAll();
  }

  async getWatchProviders(item: CatalogItem, region: string = 'US'): Promise<WatchProvidersData | null> {
    if (item.watchProviders) return item.watchProviders;
    if (!item.tmdbId) return null;

    const providers = await fetchWatchProviders(item.tmdbId, item.mediaType || 'tv', region);
    if (providers) {
      item.watchProviders = providers;
    }
    return providers;
  }
  
  async hydrate(item: CatalogItem): Promise<CatalogItem> {
    const hydrated = await hydrateMetadata(item, catalogI18nResolver.getLanguage());
    const withWatch = await hydrateWatchProviders(hydrated);
    return withWatch;
  }
}

export const catalogRegistry = new CatalogRegistry();
