import { CatalogItem } from '../../types/catalog';
import { fuzzySearch } from './fuzzySearchEngine';

export function searchCatalog(query: string, catalog: CatalogItem[]): CatalogItem[] {
  if (!query.trim()) return catalog;
  
  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  
  // 1. Exact/Substring Matches
  const exactMatches = catalog.filter(c => {
    const title = (c.title || c.name || '').toLowerCase();
    const cleanTitle = title.replace(/[^a-z0-9]/g, '');
    const origTitle = (c.original_title || c.original_name || '').toLowerCase();
    
    if (title.includes(q) || cleanTitle.includes(cleanQ) || origTitle.includes(q)) return true;
    return false;
  });
  
  // 2. Fuzzy matches on remaining
  const exactIds = new Set(exactMatches.map(c => c.id));
  const remaining = catalog.filter(c => !exactIds.has(c.id));
  
  const fuzzyResults = fuzzySearch(q, remaining, item => (item.title || item.name || ''), 0.4);
  
  return [...exactMatches, ...fuzzyResults.map(r => r.item)];
}
