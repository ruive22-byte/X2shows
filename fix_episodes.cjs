const fs = require('fs');

let code = fs.readFileSync('src/services/resolvers/EpisodeResolver.ts', 'utf-8');

// The resolver shouldn't fail silently or generate fallback titles.
// The movie generation part is okay-ish for modeling a movie as an episode, but we should make sure missing metadata returns an explicit failure, not just `metadata = undefined`.
code = code.replace(/errors: identityCheck\.valid \? \[\] : \['CONTENT_MISMATCH'\]/g, 'errors: (!identityCheck.valid) ? [\'CONTENT_MISMATCH\'] : (!metadata ? [\'METADATA_UNAVAILABLE\'] : [])');

fs.writeFileSync('src/services/resolvers/EpisodeResolver.ts', code);
