const fs = require('fs');
let code = fs.readFileSync('src/services/apiFallbackService.ts', 'utf8');

const replacement = `export async function getNextFallbackArtwork(
  title: string,
  failedSource?: string | null,
  failedUrl?: string | null,
  tmdbId?: number | null,
  imdbId?: string | null
): Promise<{ url: string | null; source: 'tmdb' | 'tvmaze' | 'omdb' | 'placeholder' } | null> {
  const normKey = title.toLowerCase().trim();

  // If we have an IMDb ID and we haven't tried OMDb yet
  if (imdbId && (!failedSource || failedSource === 'tmdb' || failedSource === 'registry')) {
    try {
       // OMDb by IMDb ID
       const res = await fetch(\`https://www.omdbapi.com/?apikey=7b64a2b9&i=\${imdbId}\`);
       if (res.ok) {
           const omdbData = await res.json();
           if (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A' && omdbData.Poster !== failedUrl) {
               saveImageToCache(normKey, {
                 source: 'omdb',
                 posterUrl: omdbData.Poster,
                 backdropUrl: omdbData.Poster,
                 omdbId: imdbId,
                 title: omdbData.Title || title,
               });
               return { url: omdbData.Poster, source: 'omdb' };
           }
       }
    } catch(e) {}
    
    // TVmaze by IMDb ID
    try {
       const tvRes = await fetch(\`https://api.tvmaze.com/lookup/shows?imdb=\${imdbId}\`);
       if (tvRes.ok) {
           const tvmazeData = await tvRes.json();
           if (tvmazeData && tvmazeData.image) {
               const tvmazeUrl = tvmazeData.image.original || tvmazeData.image.medium;
               if (tvmazeUrl && tvmazeUrl !== failedUrl) {
                   saveImageToCache(normKey, {
                     source: 'tvmaze',
                     posterUrl: tvmazeUrl,
                     backdropUrl: tvmazeUrl,
                     tvmazeId: tvmazeData.id,
                     title: tvmazeData.name || title,
                   });
                   return { url: tvmazeUrl, source: 'tvmaze' };
               }
           }
       }
    } catch(e) {}
  }

  // Title search fallback - TVmaze
  if (!failedSource || failedSource === 'tmdb' || failedSource === 'registry') {
    const tvmazeShow = await searchTvMazeShow(title);
    if (tvmazeShow && tvmazeShow.image) {
      const tvmazeUrl = tvmazeShow.image.original || tvmazeShow.image.medium;
      if (tvmazeUrl && tvmazeUrl !== failedUrl) {
        saveImageToCache(normKey, {
          source: 'tvmaze',
          posterUrl: tvmazeUrl,
          backdropUrl: tvmazeUrl,
          tvmazeId: tvmazeShow.id,
          title: tvmazeShow.name || title,
        });
        return { url: tvmazeUrl, source: 'tvmaze' };
      }
    }
  }

  // Title search fallback - OMDb
  if (!failedSource || failedSource === 'tmdb' || failedSource === 'tvmaze' || failedSource === 'registry') {
    const omdbData = await searchOmdbShow(title);
    if (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A' && omdbData.Poster !== failedUrl) {
      saveImageToCache(normKey, {
        source: 'omdb',
        posterUrl: omdbData.Poster,
        backdropUrl: omdbData.Poster,
        omdbId: omdbData.imdbID,
        title: omdbData.Title || title,
      });
      return { url: omdbData.Poster, source: 'omdb' };
    }
  }

  // If all 3 tiers fail, return placeholder (Tier 4)
  return { url: null, source: 'placeholder' };
}`;

code = code.replace(
  /export async function getNextFallbackArtwork\([\s\S]*?\/\/ If all 3 tiers fail, return placeholder \(Tier 4\)\n  return \{ url: null, source: 'placeholder' \};\n\}/,
  replacement
);

fs.writeFileSync('src/services/apiFallbackService.ts', code, 'utf8');
