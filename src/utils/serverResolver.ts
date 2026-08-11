import { TmdbAnimatedShow } from '../data/tmdbData';

export interface StreamServer {
  id: string;
  name: string;
  badge: string;
  quality: string;
  isPrimary?: boolean;
  isBackup?: boolean;
  supportsEmbed: boolean;
  supportsPopout: boolean;
  requiresTopLevelWindow?: boolean;
  getUrl: (showOrId: TmdbAnimatedShow | string | number, season?: number, episode?: number) => string;
}

// Helper to extract ID and movie status from flexible parameter
const parseShowOrId = (showOrId: TmdbAnimatedShow | string | number) => {
  if (typeof showOrId === 'object' && showOrId !== null) {
    const isMovie = (showOrId as any).isMovie || (showOrId as any).media_type === 'movie' || (showOrId as any).navType === 'Movies' || (showOrId as any).mediaType === 'movie';
    const rawId = (showOrId as any).tmdbId || (showOrId as any).id;
    const cleanId = String(rawId || '').replace(/\D/g, '') || rawId;
    return { id: cleanId, isMovie };
  }
  const cleanId = String(showOrId || '').replace(/\D/g, '') || showOrId;
  return { id: cleanId, isMovie: false };
};

export const EMBED_SERVERS: StreamServer[] = [
  {
    id: 'server-1',
    name: 'Server Alpha (VidSrc CC)',
    badge: 'Instant Play HD',
    quality: '1080p HD',
    isPrimary: true,
    supportsEmbed: true,
    supportsPopout: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'server-2',
    name: 'Server Bravo (VidSrc Me)',
    badge: 'Fast Stream',
    quality: '1080p',
    supportsEmbed: true,
    supportsPopout: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    },
  },
  {
    id: 'server-3',
    name: 'Server Charlie (AutoEmbed Player)',
    badge: 'Multi-Source',
    quality: '1080p',
    supportsEmbed: true,
    supportsPopout: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'server-4',
    name: 'Server Delta (Embed.su HD)',
    badge: 'High Bitrate',
    quality: '1080p',
    supportsEmbed: true,
    supportsPopout: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    id: 'server-5',
    name: 'Server Echo (VidLink Direct)',
    badge: '4K Ultra VIP',
    quality: '2160p / 1080p',
    isBackup: true,
    supportsEmbed: false,
    supportsPopout: true,
    requiresTopLevelWindow: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://vidlink.pro/movie/${id}?primaryColor=00f2fe&autoplay=true&nextbutton=true`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=00f2fe&autoplay=true&nextbutton=true`;
    },
  },
  {
    id: 'server-6',
    name: 'Server Foxtrot (2Embed CC)',
    badge: 'Mirror',
    quality: '1080p',
    supportsEmbed: true,
    supportsPopout: true,
    getUrl: (showOrId, season = 1, episode = 1) => {
      const { id, isMovie } = parseShowOrId(showOrId);
      return isMovie
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
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

  public static isSandboxedIframe(): boolean {
    return typeof window !== 'undefined' && window.self !== window.top;
  }

  public static canServerEmbed(server: StreamServer): boolean {
    if (!server.supportsEmbed) return false;
    if (server.requiresTopLevelWindow && this.isSandboxedIframe()) return false;
    return true;
  }

  /**
   * Retrieves saved server ID from local storage cache (only if embed compatible)
   */
  public static getCachedServerId(): string | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const srv = EMBED_SERVERS.find((s) => s.id === cached);
        if (srv && ServerManager.canServerEmbed(srv)) {
          return cached;
        }
      }
      return null;
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
   * Probes all embed-compatible servers simultaneously with a strict timeout using Promise.any()
   * and returns the fastest responsive embed-compatible server or cached winner.
   */
  public static async resolveFastestServer(
    show: TmdbAnimatedShow,
    season = 1,
    episode = 1,
    timeoutMs = 1500
  ): Promise<{ selectedServer: StreamServer; streamUrl: string }> {
    const embeddableServers = ServerManager.getEmbedCompatibleServers();
    const cachedId = this.getCachedServerId();
    const cachedServer = embeddableServers.find((s) => s.id === cachedId);

    const probePromises = embeddableServers.map(async (server) => {
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
      const fallbackServer = cachedServer || ServerManager.getDefaultServer();
      return {
        selectedServer: fallbackServer,
        streamUrl: fallbackServer.getUrl(show, season, episode),
      };
    }
  }
}

export class ServerManager {
  public static isSandboxedIframe(): boolean {
    return typeof window !== 'undefined' && window.self !== window.top;
  }

  public static canServerEmbed(server: StreamServer): boolean {
    if (!server.supportsEmbed) return false;
    if (server.requiresTopLevelWindow && this.isSandboxedIframe()) return false;
    return true;
  }

  /**
   * Returns all registered embed servers.
   */
  public static getServers(): StreamServer[] {
    return EMBED_SERVERS;
  }

  /**
   * Returns all embed-compatible servers for the current environment.
   */
  public static getEmbedCompatibleServers(): StreamServer[] {
    return EMBED_SERVERS.filter((s) => this.canServerEmbed(s));
  }

  /**
   * Retrieves default embed-compatible server (Server Alpha / VidSrc CC).
   */
  public static getDefaultServer(): StreamServer {
    const embeddable = this.getEmbedCompatibleServers();
    return embeddable.length > 0 ? embeddable[0] : EMBED_SERVERS[0];
  }

  /**
   * Builds an iframe stream URL for a given show, server, season, and episode.
   * If requested server cannot be embedded, returns an embed-compatible fallback server.
   */
  public static buildStreamUrl(
    show: TmdbAnimatedShow,
    serverId: string = 'server-1',
    season: number = 1,
    episode: number = 1
  ): string {
    const requestedServer = EMBED_SERVERS.find((s) => s.id === serverId);
    if (requestedServer && this.canServerEmbed(requestedServer)) {
      return requestedServer.getUrl(show, season, episode);
    }
    const fallbackServer = this.getDefaultServer();
    return fallbackServer.getUrl(show, season, episode);
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

