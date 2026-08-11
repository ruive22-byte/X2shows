import { StreamServer, ServerManager } from './serverResolver';

export class StreamHealthMonitor {
  /**
   * Tests whether an embed server URL is responsive via a HEAD/GET request check,
   * returning the next healthiest backup embed-compatible server ID if the primary fails.
   */
  public static async findHealthiestServer(
    currentServerId: string,
    onFallbackTriggered?: (newServer: StreamServer) => void
  ): Promise<string> {
    const embeddableServers = ServerManager.getEmbedCompatibleServers();
    const defaultServer = ServerManager.getDefaultServer();
    const currentIndex = embeddableServers.findIndex((s) => s.id === currentServerId);
    
    // If not found in embeddable servers, start from default
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;

    // Ordered sequence starting from current server to back-ups
    const sequence = [
      ...embeddableServers.slice(safeIndex),
      ...embeddableServers.slice(0, safeIndex),
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

    return defaultServer.id;
  }
}
