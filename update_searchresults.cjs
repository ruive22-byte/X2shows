const fs = require('fs');
let code = fs.readFileSync('src/components/SearchResultsFilterView.tsx', 'utf8');

code = code.replace(
  /<TmdbImage\n\s*posterPath=\{show\.poster_path\}/g,
  `<TmdbImage
            tmdbId={show.tmdbId}
            posterPath={show.poster_path}`
);

fs.writeFileSync('src/components/SearchResultsFilterView.tsx', code, 'utf8');
