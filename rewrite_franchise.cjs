const fs = require('fs');
let code = fs.readFileSync('src/services/tmdbApi.ts', 'utf8');

const startIdx = code.indexOf('export function getFranchiseCollection');
const endIdx = code.indexOf('export function getRelatedAndRecommendedShows');

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `
export async function getFranchiseCollection(
  show: import('../data/tmdbData').TmdbAnimatedShow,
): Promise<FranchiseCollection | null> {
  const lower = show.title.toLowerCase();
  let collectionId = show.belongs_to_collection?.id || show.collection_id;
  
  // Attempt to search TMDB for collection if not directly linked but is a movie
  if (!collectionId && show.media_type === 'movie') {
    try {
      const searchRes = await fetch(\`https://api.themoviedb.org/3/search/collection?api_key=428f090b8db522bfbf763be5fef93026&query=\${encodeURIComponent(show.title)}\`);
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.results?.length > 0) {
           collectionId = data.results[0].id;
        }
      }
    } catch (e) {
      console.warn("Collection search failed", e);
    }
  }

  if (collectionId) {
    try {
      const res = await fetch(\`https://api.themoviedb.org/3/collection/\${collectionId}?api_key=428f090b8db522bfbf763be5fef93026\`);
      if (res.ok) {
        const data = await res.json();
        if (data.parts && data.parts.length > 0) {
          const items = data.parts
            .filter((part: any) => part.poster_path && part.backdrop_path)
            .map((part: any, index: number) => ({
            id: \`franchise-\${part.id}\`,
            tmdbId: part.id,
            title: part.title || part.name,
            year: part.release_date ? part.release_date.substring(0, 4) : 'TBD',
            roleInUniverse: \`Entry \${index + 1}\`,
            poster_path: part.poster_path,
            backdrop_path: part.backdrop_path,
            rating: part.vote_average || 0,
            overview: part.overview,
            genres: [], // Requires genre mapping or extra fetch
            qualityBadge: '4K UHD'
          }));
          return {
            universeName: data.name,
            tagline: data.overview || \`The complete \${data.name} collection\`,
            totalEntries: items.length,
            items
          };
        }
      }
    } catch (e) {
      console.warn("Collection fetch failed", e);
    }
  }

  // Dynamic Search Fallback (TV Shows or Movies without Collection)
  try {
     const titleStem = show.title.split(/[:\-]/)[0].trim();
     const searchRes = await fetch(\`https://api.themoviedb.org/3/search/tv?api_key=428f090b8db522bfbf763be5fef93026&query=\${encodeURIComponent(titleStem)}\`);
     if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.results?.length > 1) { // Only if we found multiple related shows
           // Filter candidates: they must include the stem in their title, and have a poster and backdrop
           const candidates = data.results.filter((c: any) => 
               (c.name.toLowerCase().includes(titleStem.toLowerCase()) || 
                c.original_name?.toLowerCase().includes(titleStem.toLowerCase())) &&
               c.poster_path && c.backdrop_path
           ).sort((a: any, b: any) => {
               const dateA = new Date(a.first_air_date || '9999-12-31').getTime();
               const dateB = new Date(b.first_air_date || '9999-12-31').getTime();
               return dateA - dateB;
           });

           if (candidates.length > 0) {
               return {
                  universeName: \`\${titleStem} Universe\`,
                  tagline: \`Chronological timeline for \${titleStem}\`,
                  totalEntries: candidates.length,
                  items: candidates.map((c: any, i: number) => ({
                    id: \`franchise-\${c.id}\`,
                    tmdbId: c.id,
                    title: c.name,
                    year: c.first_air_date ? c.first_air_date.substring(0, 4) : 'TBD',
                    roleInUniverse: \`Series \${i + 1}\`,
                    poster_path: c.poster_path,
                    backdrop_path: c.backdrop_path,
                    rating: c.vote_average || 0,
                    overview: c.overview,
                    genres: [],
                    qualityBadge: 'HD'
                  }))
               };
           }
        }
     }
  } catch (e) {
    console.warn("Dynamic fallback search failed", e);
  }

  // If nothing found or valid, return null to hide the franchise tab
  return null;
}

`;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/services/tmdbApi.ts', code, 'utf8');
  console.log("Rewrote getFranchiseCollection in tmdbApi.ts");
} else {
  console.log("Could not find start/end bounds.");
}
