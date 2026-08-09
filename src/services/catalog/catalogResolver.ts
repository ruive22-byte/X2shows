import { CatalogItem } from '../../types/catalog';
import { resolvePoster, resolveBackdrop } from '../../utils/posterResolver';

export function normalizeCatalogItem(item: CatalogItem): CatalogItem {
  const resolvedPosterUrl = resolvePoster(item);
  const resolvedBackdropUrl = resolveBackdrop(item);

  return {
    ...item,
    resolvedPosterUrl,
    resolvedBackdropUrl,
    // Provide sensible defaults for UI consistency if missing
    matchScore: item.matchScore || (item.vote_average ? Math.round(item.vote_average * 10) : 85),
    durationMinutes: item.durationMinutes || (item.mediaType === 'movie' ? 120 : 24),
  };
}
