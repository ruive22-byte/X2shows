const fs = require('fs');
let code = fs.readFileSync('src/components/ShowCard.tsx', 'utf8');

code = code.replace(
  /<TmdbImage\n\s*showId=\{show\.id\}\n\s*id=\{show\.id\}\n\s*posterPath=\{posterPath\}/,
  `<TmdbImage
          showId={show.id}
          id={show.id}
          tmdbId={show.tmdbId}
          imdbId={show.imdbId}
          posterPath={posterPath}`
);

fs.writeFileSync('src/components/ShowCard.tsx', code, 'utf8');
