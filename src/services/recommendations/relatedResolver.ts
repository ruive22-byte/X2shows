import { CatalogItem } from '../../types/catalog';
import { areInSameFranchise } from './franchiseResolver';

export function resolveRelatedItems(currentShow: CatalogItem, catalog: CatalogItem[]): CatalogItem[] {
  return catalog.filter(s => {
    if (s.id === currentShow.id || s.tmdbId === currentShow.tmdbId) return false;
    return areInSameFranchise(currentShow, s);
  });
}
