const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/StreamResolver.ts', 'utf-8');

// replace ProviderHealthRegistry implementation
const healthImpl = `export class ProviderHealthRegistry {
  public static getHealth(providerId: string) {
    try {
      const data = localStorage.getItem(\`x2shows_provider_health_\${providerId}\`);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      providerId,
      attempts: 0,
      successes: 0,
      failures: 0, // legacy
      embedBlocked: 0,
      playbackFailures: 0, // legacy
      identityMismatches: 0,
      networkFailures: 0,
      providerErrors: 0,
      playbackConfirmed: 0,
      lastSuccess: 0,
      lastFailure: 0,
      averageResolutionMs: 0
    };
  }

  public static updateHealth(providerId: string, updates: any) {
    const health = this.getHealth(providerId);
    Object.assign(health, updates);
    try {
      localStorage.setItem(\`x2shows_provider_health_\${providerId}\`, JSON.stringify(health));
    } catch (e) {}
  }
}`;

code = code.replace(/export class ProviderHealthRegistry \{[\s\S]*?\n\}\n/m, healthImpl + "\n");

// Update StreamResolver to use SourceDiscoveryEngine
// Wait, we need to replace StreamCandidate definition in StreamResolver.ts with re-exporting it from SourceDiscoveryEngine, or just putting all of it in StreamResolver.ts.

fs.writeFileSync('src/services/resolvers/StreamResolver.ts', code);
console.log('Fixed provider health registry');
