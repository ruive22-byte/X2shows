import { TmdbAnimatedShow } from '../../data/tmdbData';
import { EMBED_SERVERS, ServerManager, StreamServer } from '../../utils/serverResolver';
import { ProviderHealthRegistry } from './StreamResolver';
import { ProviderIdentityMapper } from './ProviderIdentityMapper';

export interface MediaIdentity {
  showId: string;
  title: string;
  type: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface StreamCandidate {
  id: string; // Add this back for backwards compatibility if needed
  url: string;
  sourceProvider: string;
  discoveryMethod: string;
  requestedIdentity: MediaIdentity;
  resolvedIdentity?: MediaIdentity;
  providerMediaId?: string;
  providerEpisodeId?: string;
  discoveredAt: number;
  identityConfidence: number;
  providerHealthScore: number;
  verificationStatus:
    | "UNVERIFIED"
    | "IDENTITY_VALID"
    | "IDENTITY_MISMATCH"
    | "EMBED_BLOCKED"
    | "PLAYBACK_CONFIRMED"
    | "FAILED";
  // keep server for legacy
  server: StreamServer;
}

export class SourceDiscoveryEngine {
  public static async discover({
    show,
    seasonNumber,
    episodeNumber
  }: {
    show: TmdbAnimatedShow;
    seasonNumber?: number;
    episodeNumber?: number;
  }): Promise<StreamCandidate[]> {
    const showId = String(show.tmdbId || show.id);
    const type = (show.media_type === 'movie' || show.navType === 'Movies') ? 'movie' : 'tv';
    const requestedIdentity: MediaIdentity = {
      showId,
      title: show.title || show.name || 'Unknown',
      type,
      seasonNumber,
      episodeNumber
    };

    const candidates: StreamCandidate[] = [];

    for (const server of EMBED_SERVERS) {
      if (!ServerManager.canServerEmbed(server)) {
        continue; // Skip servers requiring top-level windows for embedded pipeline
      }
      const providerMediaId = ProviderIdentityMapper.getProviderMediaId(server.id, showId);
      
      if (providerMediaId === 'IDENTITY_MAPPING_UNAVAILABLE') {
        continue; // Skip this provider because we cannot safely map identity
      }

      const url = server.getUrl({ id: providerMediaId, isMovie: type === "movie" } as any, seasonNumber, episodeNumber);
      const health = ProviderHealthRegistry.getHealth(server.id);
      
      // Calculate health score: penalized for identity mismatches
      const successes = health.successes || 0;
      const attempts = health.attempts || 0;
      const mismatches = health.identityMismatches || 0;
      const playbackFailures = health.playbackFailures || 0;
      
      const playbackSuccessRate = attempts > 0 ? (successes / attempts) : 1;
      const mismatchRate = attempts > 0 ? (mismatches / attempts) : 0;
      
      // Basic health score formula
      const score = (playbackSuccessRate * 100) - (mismatchRate * 500) - (playbackFailures * 10);

      candidates.push({
        id: `${server.id}-${showId}-${seasonNumber}-${episodeNumber}`,
        url,
        sourceProvider: server.id,
        discoveryMethod: 'url-template',
        requestedIdentity,
        providerMediaId,
        discoveredAt: Date.now(),
        identityConfidence: 1.0, // verified via mapping
        providerHealthScore: score,
        verificationStatus: "UNVERIFIED",
        server
      });
    }

    if (candidates.length === 0) {
      // throw new Error('SOURCE_UNAVAILABLE'); // Wait, legacy StreamResolver assumes array return
    }

    return candidates.sort((a, b) => b.providerHealthScore - a.providerHealthScore);
  }
}
