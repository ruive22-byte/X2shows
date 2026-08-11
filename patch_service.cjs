const fs = require('fs');
let code = fs.readFileSync('src/services/seasonFetcherService.ts', 'utf-8');
code = code.replace(
  'this.fetchSeasonEpisodes(show.tmdbId, s).then(episodes => {',
  'this.fetchSeasonEpisodes(show.tmdbId || show.id, s).then(episodes => {'
);
fs.writeFileSync('src/services/seasonFetcherService.ts', code);
