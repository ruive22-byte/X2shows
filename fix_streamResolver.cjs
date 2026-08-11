const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/StreamResolver.ts', 'utf-8');

// Replace StreamCandidate definition with re-export
code = code.replace(/export interface StreamCandidate \{[\s\S]*?score: number;\n  server: StreamServer;\n\}/m, "export { type StreamCandidate } from './SourceDiscoveryEngine';\nimport { StreamCandidate } from './SourceDiscoveryEngine';\nimport { SourceDiscoveryEngine } from './SourceDiscoveryEngine';");

// Replace getCandidates implementation to use SourceDiscoveryEngine
code = code.replace(/public static async getCandidates\([\s\S]*?return candidates;\n  \}/m, `public static async getCandidates(
    show: TmdbAnimatedShow,
    season: number = 1,
    episode: number = 1
  ): Promise<StreamCandidate[]> {
    return SourceDiscoveryEngine.discover({ show, seasonNumber: season, episodeNumber: episode });
  }`);

fs.writeFileSync('src/services/resolvers/StreamResolver.ts', code);
console.log('Fixed StreamResolver');
