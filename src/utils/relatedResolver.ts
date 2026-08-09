import { TmdbAnimatedShow } from '../data/tmdbData';

// Generate a stem / root token list from the title to match against others
function getTitleTokens(title: string): string[] {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
}

export function getRelatedShows(currentShow: TmdbAnimatedShow, catalog: TmdbAnimatedShow[]): TmdbAnimatedShow[] {
  const currentTitle = (currentShow.title || currentShow.name || '').toLowerCase();
  const currentTokens = getTitleTokens(currentTitle);
  
  return catalog.filter(s => {
    if (s.id === currentShow.id || s.tmdbId === currentShow.tmdbId) return false;
    
    // Exact match of collection/franchise id if available
    if (currentShow.franchiseId && s.franchiseId === currentShow.franchiseId) return true;
    if (currentShow.collection_id && s.collection_id === currentShow.collection_id) return true;
    if (currentShow.belongs_to_collection?.id && s.belongs_to_collection?.id === currentShow.belongs_to_collection?.id) return true;

    const sTitle = (s.title || s.name || '').toLowerCase();
    
    // Explicit subset check (e.g., "Ben 10" in "Ben 10: Alien Force")
    if (sTitle.includes(currentTitle + ':') || sTitle.includes(currentTitle + ' ') || currentTitle.includes(sTitle + ':') || currentTitle.includes(sTitle + ' ')) {
      return true;
    }

    // Token intersection for similar titles (e.g., "Avatar: The Last Airbender" and "The Legend of Korra" won't match tokens, but we rely on TMDB collections or tags for those. Wait, for Spider-Man into the spider-verse it will match 'spider')
    const sTokens = getTitleTokens(sTitle);
    let overlap = 0;
    for (const t of currentTokens) {
      if (sTokens.includes(t)) overlap++;
    }
    
    // If they share at least 2 significant words, or 1 highly significant word (like long unique words)
    if (overlap >= 2) return true;
    if (overlap === 1 && currentTokens.length === 1 && sTokens.length > 1) return true;

    return false;
  });
}

export function getRecommendedShows(currentShow: TmdbAnimatedShow, catalog: TmdbAnimatedShow[], relatedShows: TmdbAnimatedShow[]): TmdbAnimatedShow[] {
  const targetGenres = new Set((currentShow.genres || []).map(g => (typeof g === 'string' ? g.toLowerCase() : g)));
  const targetStudio = (currentShow.studio || '').toLowerCase();
  
  const relatedIds = new Set(relatedShows.map(s => s.id));
  
  const scored = catalog
    .filter(s => {
      if (s.id === currentShow.id || s.tmdbId === currentShow.tmdbId) return false;
      if (relatedIds.has(s.id)) return false;
      return true;
    })
    .map(s => {
      let score = 0;
      
      // Match genres
      (s.genres || []).forEach(g => {
        if (targetGenres.has((typeof g === 'string' ? g.toLowerCase() : g))) score += 3;
      });
      
      // Match media type
      if (s.media_type === currentShow.media_type) score += 2;
      
      // Match high score
      if (s.vote_average && s.vote_average >= 8.5) score += 2;
      
      // Studio match
      if (targetStudio && (s.studio || '').toLowerCase() === targetStudio) score += 4;
      
      // Category match
      if (currentShow.category && s.category === currentShow.category) score += 2;
      
      return { show: s, score };
    });
    
  scored.sort((a, b) => b.score - a.score);
  
  // Return unique shows, avoiding duplicates
  const uniqueShows = [];
  const seenIds = new Set();
  for (const item of scored) {
    if (!seenIds.has(item.show.id) && !seenIds.has(item.show.tmdbId)) {
      seenIds.add(item.show.id);
      seenIds.add(item.show.tmdbId);
      uniqueShows.push(item.show);
      if (uniqueShows.length >= 12) break; // limit to 12
    }
  }
  
  return uniqueShows;
}
