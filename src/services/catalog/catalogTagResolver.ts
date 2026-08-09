import { CatalogItem } from '../../types/catalog';

export interface CatalogTag {
  id: string;
  label: string;
  type: 'genre' | 'era' | 'studio' | 'vibe';
}

/**
 * Derives rich sub-category tags and smart badges automatically for catalog items.
 */
export function deriveAutoTags(item: Partial<CatalogItem>): string[] {
  const tags = new Set<string>();

  // 1. Era tagging by release date
  const yearStr = item.first_air_date || item.release_date || '';
  const year = parseInt(yearStr.slice(0, 4), 10);
  if (!isNaN(year)) {
    if (year >= 1990 && year < 2000) tags.add('90s Nostalgia');
    else if (year >= 2000 && year < 2010) tags.add('2000s Classics');
    else if (year >= 2010 && year < 2020) tags.add('Modern Classics');
    else if (year >= 2020) tags.add('New Release');
  }

  // 2. Studio / Network tags
  const studio = (item.studio || '').toLowerCase();
  if (studio.includes('cartoon network')) tags.add('Cartoon Network');
  else if (studio.includes('nickelodeon')) tags.add('Nickelodeon');
  else if (studio.includes('disney')) tags.add('Disney Animation');
  else if (studio.includes('fortiche') || studio.includes('sony') || studio.includes('trigger') || studio.includes('ufotable') || studio.includes('madhouse')) {
    tags.add('Peak Sakuga');
  }

  // 3. Vibe / Genre tags from genres and overview
  const genres = (item.genres || []).map(g => g.toLowerCase());
  const overview = (item.overview || '').toLowerCase();
  const title = (item.title || item.name || '').toLowerCase();

  if (genres.some(g => g.includes('action') || g.includes('adventure'))) {
    tags.add('Action-Packed');
  }
  if (genres.some(g => g.includes('comedy')) || overview.includes('funny') || overview.includes('hilarious')) {
    tags.add('Comedy & Laughs');
  }
  if (genres.some(g => g.includes('sci-fi') || g.includes('fantasy')) || overview.includes('magic') || overview.includes('future')) {
    tags.add('Sci-Fi & Fantasy');
  }
  if (genres.some(g => g.includes('dark') || g.includes('horror')) || overview.includes('dark') || overview.includes('crime')) {
    tags.add('Adult & Dark');
  }
  if (title.includes('hero') || title.includes('ninja') || overview.includes('superpower') || overview.includes('hero')) {
    tags.add('Superheroes');
  }
  if (title.includes('sponge') || title.includes('bear') || title.includes('jerry') || title.includes('rugrats')) {
    tags.add('Family & Kids');
  }

  // Fallback tag
  if (tags.size === 0) {
    tags.add('Top Rated Animation');
  }

  return Array.from(tags);
}

export function tagCatalogItems(items: CatalogItem[]): CatalogItem[] {
  return items.map(item => {
    const autoTags = deriveAutoTags(item);
    return {
      ...item,
      genreTags: Array.from(new Set([...(item.genreTags || []), ...autoTags]))
    };
  });
}
