import { CatalogItem } from '../../types/catalog';
import { areInSameFranchise } from './franchiseResolver';

export function getRecommendations(
  currentShow: CatalogItem,
  catalog: CatalogItem[],
  relatedShows: CatalogItem[]
): CatalogItem[] {
  const targetGenres = new Set((currentShow.genres || []).map(g => (typeof g === 'string' ? g.toLowerCase() : g)));
  const targetStudio = (currentShow.studio || '').toLowerCase();
  const relatedIds = new Set(relatedShows.map(s => s.id));
  
  const scored = catalog
    .filter(s => {
      if (s.id === currentShow.id || s.tmdbId === currentShow.tmdbId) return false;
      if (relatedIds.has(s.id)) return false;
      // Exclude same franchise from pure recommendations if they weren't caught in related
      if (areInSameFranchise(currentShow, s)) return false;
      return true;
    })
    .map(s => {
      let score = 0;
      
      // Genre (30%)
      let genreMatches = 0;
      (s.genres || []).forEach(g => {
        if (targetGenres.has((typeof g === 'string' ? g.toLowerCase() : g))) genreMatches++;
      });
      score += Math.min(genreMatches * 10, 30);
      
      // Studio (15%)
      if (targetStudio && (s.studio || '').toLowerCase() === targetStudio) score += 15;
      
      // MediaType (10%)
      if (s.mediaType === currentShow.mediaType) score += 10;
      
      // Release Era (5%)
      const y1 = parseInt((currentShow.release_date || currentShow.first_air_date || '2000').substring(0, 4), 10);
      const y2 = parseInt((s.release_date || s.first_air_date || '2000').substring(0, 4), 10);
      if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1 - y2) <= 5) score += 5;
      
      // High rating boost
      if (s.vote_average && s.vote_average >= 8.0) score += 5;
      
      return { show: s, score };
    })
    .filter(res => res.score > 0);
    
  scored.sort((a, b) => b.score - a.score);
  
  const uniqueShows = [];
  const seenIds = new Set();
  for (const item of scored) {
    if (!seenIds.has(item.show.id) && !seenIds.has(item.show.tmdbId)) {
      seenIds.add(item.show.id);
      if (item.show.tmdbId) seenIds.add(item.show.tmdbId);
      uniqueShows.push(item.show);
      if (uniqueShows.length >= 12) break;
    }
  }
  
  return uniqueShows;
}
