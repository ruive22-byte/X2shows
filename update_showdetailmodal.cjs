const fs = require('fs');
let code = fs.readFileSync('src/components/ShowDetailModal.tsx', 'utf8');

code = code.replace(
  /<TmdbImage\s*\n\s*showId=\{show\.id\}/,
  `<TmdbImage 
            showId={show.id}
            tmdbId={show.tmdbId}
            imdbId={show.imdbId}`
);

fs.writeFileSync('src/components/ShowDetailModal.tsx', code, 'utf8');
