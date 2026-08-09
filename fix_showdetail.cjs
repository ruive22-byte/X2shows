const fs = require('fs');
let code = fs.readFileSync('src/components/ShowDetailPage.tsx', 'utf8');
code = code.replace(/<TmdbImage item=\{card\}\n            backdropPath=\{show/g, "<TmdbImage item={show}\n            backdropPath={show");
code = code.replace(/<TmdbImage item=\{card\}\n                  posterPath=\{show/g, "<TmdbImage item={show}\n                  posterPath={show");
code = code.replace(/<TmdbImage item=\{card\}\n                      posterPath=\{item\.posterUrl/g, "<TmdbImage item={item}\n                      posterPath={item.posterUrl");
code = code.replace(/<TmdbImage item=\{card\}\n                      posterPath=\{recShow/g, "<TmdbImage item={recShow}\n                      posterPath={recShow");
code = code.replace(/<TmdbImage item=\{card\}\n                      posterPath=\{show\.posterUrl/g, "<TmdbImage item={show}\n                      posterPath={show.posterUrl");
fs.writeFileSync('src/components/ShowDetailPage.tsx', code, 'utf8');
