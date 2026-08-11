const fs = require('fs');
let code = fs.readFileSync('src/services/seasonFetcherService.ts', 'utf-8');

code = code.replace(
  /this\.fetchSeasonEpisodes\(show\.tmdbId, s\)\.then\(episodes => \{\n          allSeasons\[s\] = episodes;\n        \}\)/,
  "this.fetchSeasonEpisodes(show.tmdbId, s).then(episodes => {\n          allSeasons[s] = episodes;\n        }).catch(err => { console.warn(`Failed to fetch season ${s}`, err); })"
);

fs.writeFileSync('src/services/seasonFetcherService.ts', code);
