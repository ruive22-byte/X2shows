const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/StreamResolver.ts', 'utf-8');

code = code.replace(/candidate\.verification\.embedAllowed = data\.playable;/g, 'candidate.verificationStatus = data.playable ? "UNVERIFIED" : "EMBED_BLOCKED";');
code = code.replace(/candidate\.verification\.playback = "failed";/g, 'candidate.verificationStatus = "FAILED";');
code = code.replace(/candidate\.providerId/g, 'candidate.sourceProvider');
code = code.replace(/candidate\.verification\.embedAllowed = false;/g, 'candidate.verificationStatus = "EMBED_BLOCKED";');
code = code.replace(/candidate\.verification\.lastCheckedAt = Date\.now\(\);/g, '');

fs.writeFileSync('src/services/resolvers/StreamResolver.ts', code);
