import { StreamServer, EMBED_SERVERS } from './serverResolver';

export class StreamHealthMonitor {
  /**
   * Tests whether an embed server URL is responsive via a HEAD/GET request check,
   * returning the next healthiest backup server ID if the primary fails.
   */
  public static async findHealthiestServer(
    currentServerId: string,
    onFallbackTriggered?: (newServer: StreamServer) => void
  ): Promise<string> {
    const currentIndex = EMBED_SERVERS.findIndex((s) => s.id === currentServerId);
    
    // If already on the primary server, verify or return
    if (currentIndex === -1) return EMBED_SERVERS[0].id;

    // Ordered sequence starting from current server to back-ups
    const sequence = [
      ...EMBED_SERVERS.slice(currentIndex),
      ...EMBED_SERVERS.slice(0, currentIndex),
    ];

    for (const server of sequence) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s health threshold

        const testShow: any = { tmdbId: 324857, media_type: 'movie', navType: 'Movies' };
        await fetch(server.getUrl(testShow), {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        
        if (server.id !== currentServerId && onFallbackTriggered) {
          onFallbackTriggered(server);
        }
        return server.id;
      } catch (err) {
        console.warn(`Server ${server.name} unreachable, probing next fallback...`, err);
      }
    }

    return EMBED_SERVERS[0].id;
  }
}
