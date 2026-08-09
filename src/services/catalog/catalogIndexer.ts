import { CatalogItem } from '../../types/catalog';
import { calculateFuzzyScore } from '../search/fuzzySearchEngine';

export class CatalogIndexer {
  private items: CatalogItem[] = [];
  private idMap = new Map<string, CatalogItem>();
  private tmdbIdMap = new Map<number, CatalogItem>();
  private genreMap = new Map<string, CatalogItem[]>();
  private studioMap = new Map<string, CatalogItem[]>();
  private franchiseMap = new Map<string, CatalogItem[]>();
  
  clear() {
    this.items = [];
    this.idMap.clear();
    this.tmdbIdMap.clear();
    this.genreMap.clear();
    this.studioMap.clear();
    this.franchiseMap.clear();
  }
  
  indexItem(item: CatalogItem, franchiseKey?: string) {
    this.items.push(item);
    
    if (item.id) this.idMap.set(String(item.id), item);
    if (item.tmdbId) this.tmdbIdMap.set(item.tmdbId, item);
    
    // Index genres
    (item.genres || []).concat(item.genreTags || []).forEach(g => {
      const gNormalized = typeof g === 'string' ? g.toLowerCase() : '';
      if (gNormalized) {
        if (!this.genreMap.has(gNormalized)) this.genreMap.set(gNormalized, []);
        this.genreMap.get(gNormalized)!.push(item);
      }
    });
    
    // Index studio
    if (item.studio) {
      const sNormalized = item.studio.toLowerCase();
      if (!this.studioMap.has(sNormalized)) this.studioMap.set(sNormalized, []);
      this.studioMap.get(sNormalized)!.push(item);
    }
    
    // Index franchise
    if (franchiseKey) {
      if (!this.franchiseMap.has(franchiseKey)) this.franchiseMap.set(franchiseKey, []);
      this.franchiseMap.get(franchiseKey)!.push(item);
    }
  }
  
  getAll() { return this.items; }
  getById(id: string) { return this.idMap.get(id); }
  getByTmdbId(tmdbId: number) { return this.tmdbIdMap.get(tmdbId); }
  
  getByGenre(genre: string) { return this.genreMap.get(genre.toLowerCase()) || []; }
  getByStudio(studio: string) { return this.studioMap.get(studio.toLowerCase()) || []; }
  getByFranchise(franchiseKey: string) { return this.franchiseMap.get(franchiseKey) || []; }
}
