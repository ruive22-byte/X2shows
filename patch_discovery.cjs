const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/SourceDiscoveryEngine.ts', 'utf-8');
code = code.replace(
  'const url = server.getUrl(providerMediaId, seasonNumber, episodeNumber);',
  'const url = server.getUrl({ id: providerMediaId, isMovie: type === "movie" } as any, seasonNumber, episodeNumber);'
);
fs.writeFileSync('src/services/resolvers/SourceDiscoveryEngine.ts', code);
