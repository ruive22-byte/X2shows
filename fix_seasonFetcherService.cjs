const fs = require('fs');
let code = fs.readFileSync('src/services/seasonFetcherService.ts', 'utf-8');

// Replace generateFallbackEpisodes calls with throwing an error
code = code.replace(/return this\.generateFallbackEpisodes\(tmdbId,\s*seasonNumber\);/g, "throw new Error('METADATA_UNAVAILABLE');");

// And empty array if validEpisodes.length == 0
code = code.replace(/return validEpisodes\.length > 0 \? validEpisodes : throw new Error\('METADATA_UNAVAILABLE'\);/g, "if (validEpisodes.length === 0) throw new Error('METADATA_UNAVAILABLE'); return validEpisodes;");

// Wait, the original code had:
// return validEpisodes.length > 0 ? validEpisodes : this.generateFallbackEpisodes(tmdbId, seasonNumber);
code = code.replace(/return validEpisodes\.length > 0 \? validEpisodes : this\.generateFallbackEpisodes\(tmdbId, seasonNumber\);/g, "if (validEpisodes.length === 0) throw new Error('METADATA_UNAVAILABLE');\n      return validEpisodes;");

// Remove the generateFallbackEpisodes method
code = code.replace(/private static generateFallbackEpisodes[\s\S]*?\}\)\.filter\(Boolean\);\n  \}/, '');

fs.writeFileSync('src/services/seasonFetcherService.ts', code);
