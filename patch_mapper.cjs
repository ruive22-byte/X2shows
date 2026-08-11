const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/ProviderIdentityMapper.ts', 'utf-8');
code = code.replace(
  "return 'IDENTITY_MAPPING_UNAVAILABLE';",
  "return canonicalShowId;"
);
fs.writeFileSync('src/services/resolvers/ProviderIdentityMapper.ts', code);
