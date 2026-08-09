import { TmdbAnimatedShow } from '../data/tmdbData';

export interface StreamServer {
  id: string;
  name: string;
  badge: string;
  quality: string;
  isPrimary?: boolean;
  isBackup?: boolean;
  getUrl: (showOrId: TmdbAnimatedShow | string | number, season?: number, episode?: number) => string;
}

// Helper to extract ID and movie status from flexible parameter
const parseShowOrId = (showOrId: TmdbAnimatedShow | string | number) => {
  if (typeof showOrId === 'object' && showOrId !== null) {
    const isMovie = showOrId.media_type === 'movie' || showOrId.navType === 'Movies' || showOrId.mediaType === 'movie';
    const id = showOrId.tmdbId || showOrId.id;
    return { id, isMovie };
  }
  return { id: showOrId, isMovie: false };
};

export const EMBED_SERVERS: StreamServer[] = [
  {
    id: 'server-1',
    name: 'Server Alpha (VidLink Direct)',
    badge: 'Instant Play 4K',
    quality: '2160p / 1080p',
    isPrimary: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidlink.pro/movie/${id}?primaryColor=00f2fe&autoplay=true&nextbutton=true`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=00f2fe&autoplay=true&nextbutton=true`;
    },
  },
  {
    id: 'server-2',
    name: 'Server Bravo (VidSrc Pro)',
    badge: 'Fast Load',
    quality: '1080p',
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidsrc.pro/embed/movie/${id}`
        : `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'server-3',
    name: 'Server Charlie (SuperEmbed / Multi)',
    badge: 'Auto-Start',
    quality: '1080p',
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'server-4',
    name: 'Server Delta (2Embed CC)',
    badge: 'Backup',
    quality: '1080p',
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    },
  },
  {
    id: 'server-5',
    name: 'Server Echo (VidSrc VIP Mirror)',
    badge: '4K Ultra',
    quality: '2160p',
    isBackup: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidsrc.vip/embed/movie/${id}?autoplay=1`
        : `https://vidsrc.vip/embed/tv/${id}/${season}/${episode}?autoplay=1`;
    },
  },
];

export async function resolveWorkingServer(servers: StreamServer[]): Promise<StreamServer> {
  const checkServerHealth = async (server: StreamServer): Promise<StreamServer> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const dummyShow: any = { id: 324857, media_type: 'movie' };
      await fetch(server.getUrl(dummyShow, 1, 1), {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      });
      clearTimeout(timeoutId);
      return server;
    } catch {
      throw new Error(`Server ${server.name} unreachable`);
    }
  };

  try {
    return await Promise.any(servers.map((s) => checkServerHealth(s)));
  } catch {
    return servers.find((s) => s.isPrimary) || servers[0];
  }
}

export class ServerResolver {
  private static CACHE_KEY = 'xtwo_last_fastest_server_id';

  /**
   * Retrieves saved server ID from local storage cache
   */
  public static getCachedServerId(): string | null {
    try {
      return localStorage.getItem(this.CACHE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Saves fast server ID to local storage cache
   */
  public static setCachedServerId(serverId: string): void {
    try {
      localStorage.setItem(this.CACHE_KEY, serverId);
    } catch {
      // localStorage disabled or full
    }
  }

  /**
   * Probes all servers simultaneously with a strict timeout using Promise.any()
   * and returns the fastest responsive server or cached winner.
   */
  public static async resolveFastestServer(
    show: TmdbAnimatedShow,
    season = 1,
    episode = 1,
    timeoutMs = 1500
  ): Promise<{ selectedServer: StreamServer; streamUrl: string }> {
    // Check cached server first
    const cachedId = this.getCachedServerId();
    const cachedServer = EMBED_SERVERS.find((s) => s.id === cachedId);

    const probePromises = EMBED_SERVERS.map(async (server) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const url = server.getUrl(show, season, episode);

      try {
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return { selectedServer: server, streamUrl: url };
      } catch {
        clearTimeout(timeoutId);
        throw new Error(`Server ${server.id} timed out or unreachable`);
      }
    });

    try {
      const winner = await Promise.any(probePromises);
      this.setCachedServerId(winner.selectedServer.id);
      return winner;
    } catch {
      // If all probes time out or fail (due to CORS/no-cors mode), fallback to cached or primary server
      const fallbackServer = cachedServer || EMBED_SERVERS[0];
      return {
        selectedServer: fallbackServer,
        streamUrl: fallbackServer.getUrl(show, season, episode),
      };
    }
  }
}

export class ServerManager {
  /**
   * Returns all registered embed servers.
   */
  public static getServers(): StreamServer[] {
    return EMBED_SERVERS;
  }

  /**
   * Retrieves default server (Server Alpha).
   */
  public static getDefaultServer(): StreamServer {
    return EMBED_SERVERS[0];
  }

  /**
   * Builds an iframe stream URL for a given show, server, season, and episode.
   */
  public static buildStreamUrl(
    show: TmdbAnimatedShow,
    serverId: string = 'server-1',
    season: number = 1,
    episode: number = 1
  ): string {
    const server = EMBED_SERVERS.find((s) => s.id === serverId) || this.getDefaultServer();
    return server.getUrl(show, season, episode);
  }
}

export interface ServerPingResult {
  serverId: string;
  pingMs: number;
  status: 'online' | 'slow' | 'offline';
}

export class LatencyTracker {
  /**
   * Pings stream servers and returns live latency counters
   */
  public static async pingServers(show?: TmdbAnimatedShow): Promise<Record<string, ServerPingResult>> {
    const results: Record<string, ServerPingResult> = {};
    const dummyShow: any = show || { id: 324857, media_type: 'movie' };

    await Promise.all(
      EMBED_SERVERS.map(async (server) => {
        const start = performance.now();
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1500);

          await fetch(server.getUrl(dummyShow, 1, 1), { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
          clearTimeout(timer);
          const ping = Math.round(performance.now() - start);

          results[server.id] = {
            serverId: server.id,
            pingMs: ping,
            status: ping < 300 ? 'online' : 'slow',
          };
        } catch {
          results[server.id] = { serverId: server.id, pingMs: 999, status: 'offline' };
        }
      })
    );

    return results;
  }
}

