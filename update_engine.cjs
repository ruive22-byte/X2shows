const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/SourceDiscoveryEngine.ts', 'utf-8');

// Insert import
code = code.replace(/import \{ ProviderHealthRegistry \} from '\.\/StreamResolver';/, "import { ProviderHealthRegistry } from './StreamResolver';\nimport { ProviderIdentityMapper } from './ProviderIdentityMapper';");

// Update candidate mapping
code = code.replace(/const url = server\.getUrl\(show, seasonNumber, episodeNumber\);/, `const providerMediaId = ProviderIdentityMapper.getProviderMediaId(server.id, showId);
      const url = server.getUrl(providerMediaId, seasonNumber, episodeNumber);`);

code = code.replace(/providerMediaId: showId,/, `providerMediaId,`);

fs.writeFileSync('src/services/resolvers/SourceDiscoveryEngine.ts', code);
