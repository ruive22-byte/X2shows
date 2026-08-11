import { EMBED_SERVERS, StreamServer } from '../../utils/serverResolver';
import { TmdbAnimatedShow } from '../../data/tmdbData';

export { type StreamCandidate } from './SourceDiscoveryEngine';
import { StreamCandidate } from './SourceDiscoveryEngine';
import { SourceDiscoveryEngine } from './SourceDiscoveryEngine';

export class ProviderHealthRegistry {
  public static getHealth(providerId: string) {
    try {
      const data = localStorage.getItem(`x2shows_provider_health_${providerId}`);
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
      localStorage.setItem(`x2shows_provider_health_${providerId}`, JSON.stringify(health));
    } catch (e) {}
  }
}

export class StreamResolver {
  public static async getCandidates(
    show: TmdbAnimatedShow,
    season: number = 1,
    episode: number = 1
  ): Promise<StreamCandidate[]> {
    return SourceDiscoveryEngine.discover({ show, seasonNumber: season, episodeNumber: episode });
  }

  public static async checkCandidate(candidate: StreamCandidate): Promise<StreamCandidate> {
    candidate.verificationStatus = "UNVERIFIED";
    return candidate;
  }
}
