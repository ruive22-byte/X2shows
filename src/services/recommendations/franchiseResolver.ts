import { CatalogItem } from '../../types/catalog';

export function getTitleTokens(title: string): string[] {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
}

export function getFranchiseKey(item: CatalogItem): string {
  if (item.collection_id) return `collection_${item.collection_id}`;
  if (item.belongs_to_collection?.id) return `collection_${item.belongs_to_collection.id}`;
  if (item.franchiseId) return `franchise_${item.franchiseId}`;
  
  const title = (item.title || item.name || '').toLowerCase();
  if (title.includes('ben 10')) return 'ben_10';
  if (title.includes('avatar') || title.includes('korra')) return 'avatar';
  if (title.includes('spider-man') || title.includes('spider-verse')) return 'spider_man';
  if (title.includes('dragon ball')) return 'dragon_ball';
  if (title.includes('batman')) return 'batman';
  if (title.includes('justice league')) return 'justice_league';
  if (title.includes('star wars')) return 'star_wars';
  if (title.includes('transformers')) return 'transformers';
  
  return `title_stem_${getTitleTokens(title).slice(0, 2).join('_')}`;
}

export function areInSameFranchise(itemA: CatalogItem, itemB: CatalogItem): boolean {
  return getFranchiseKey(itemA) === getFranchiseKey(itemB);
}
