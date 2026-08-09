const fs = require('fs');
let code = fs.readFileSync('src/components/HeroCarousel.tsx', 'utf8');

code = code.replace(
  /<TmdbImage\s*\n\s*showId=\{currentShow\.id\}/,
  `<TmdbImage 
          showId={currentShow.id}
          tmdbId={currentShow.tmdbId}
          imdbId={currentShow.imdbId}`
);

fs.writeFileSync('src/components/HeroCarousel.tsx', code, 'utf8');
