const fs = require('fs');
let code = fs.readFileSync('src/components/ShowDetailPage.tsx', 'utf8');

code = code.replace(
  /<TmdbImage\n\s*posterPath=\{item\.poster_path\}\n\s*type="poster"\n\s*title=\{item\.title \|\| item\.name\}/g,
  `<TmdbImage
                          posterPath={item.poster_path}
                          tmdbId={item.tmdbId}
                          imdbId={item.imdbId}
                          type="poster"
                          title={item.title || item.name}`
);

// We should also replace the main hero poster and backdrop if needed.
code = code.replace(
  /<TmdbImage\n\s*posterPath=\{show\.poster_path \|\| show\.heroPosterUrl\}/,
  `<TmdbImage
                    tmdbId={show.tmdbId}
                    imdbId={show.imdbId}
                    posterPath={show.poster_path || show.heroPosterUrl}`
);
code = code.replace(
  /<TmdbImage\n\s*backdropPath=\{show\.backdrop_path\}\n\s*type="backdrop"/,
  `<TmdbImage
            tmdbId={show.tmdbId}
            imdbId={show.imdbId}
            backdropPath={show.backdrop_path}
            type="backdrop"`
);
// In related shows map:
code = code.replace(
  /<TmdbImage\n\s*showId=\{relatedShow\.id\}\n\s*posterPath=\{relatedShow\.poster_path\}/g,
  `<TmdbImage
                    showId={relatedShow.id}
                    tmdbId={relatedShow.tmdbId}
                    imdbId={relatedShow.imdbId}
                    posterPath={relatedShow.poster_path}`
);


fs.writeFileSync('src/components/ShowDetailPage.tsx', code, 'utf8');
