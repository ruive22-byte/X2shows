/**
 * STREAM DELIVERY SERVICE
 * 
 * Clean Manifest-Based Video Delivery Pipeline:
 * - Frontend passes mediaId, season, episode to requestStream()
 * - Express backend acts as source of truth and returns signed HLS manifest StreamResponse
 * - Protects downstream variant playlists and .ts segments via directory-level HMAC tokens
 */

export interface StreamRequest {
  mediaId: string;
  season?: number;
  episode?: number;
  type?: 'tv' | 'movie';
  providerId?: string;
}

export interface StreamResponse {
  protocol: 'hls';
  masterUrl: string;
  expiresAt: number;
  provider: string;
  cdnClusters?: string[];
  activeCdn?: string;
  error?: string;
}

export class StreamDeliveryService {
  /**
   * Primary entry point: Requests stream manifest from backend source of truth.
   */
  public static async requestStream(
    mediaId: string,
    season = 1,
    episode = 1,
    type: 'tv' | 'movie' = 'tv',
    providerId = 'ironwall-hls'
  ): Promise<StreamResponse> {
    try {
      const response = await fetch('/api/get-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ mediaId, season, episode, type, providerId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Stream manifest fetch failed`);
      }

      const data: StreamResponse = await response.json();
      return data;
    } catch (err: any) {
      // Offline / dev fallback manifest
      const expiresAt = Math.floor(Date.now() / 1000) + 43200;
      const activeCdn = 'moon.ironwallnet.net';
      const fallbackToken = `dev_sig_${Math.random().toString(36).substring(2, 10)}`;
      
      return {
        protocol: 'hls',
        masterUrl: `https://${activeCdn}/hls/${mediaId}/s${season}e${episode}/master.m3u8?token=${fallbackToken}&expires=${expiresAt}`,
        expiresAt,
        provider: providerId,
        cdnClusters: ['moon.ironwallnet.net', 'cdn1.x2shows.net', 'cdn2.x2shows.net'],
        activeCdn
      };
    }
  }

  /**
   * Verifies an active resource path token against backend validator.
   */
  public static async verifyResourceToken(resourcePath: string, token: string, expires: number): Promise<boolean> {
    try {
      const response = await fetch('/api/stream/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourcePath, token, expires }),
      });
      const data = await response.json();
      return !!data.valid;
    } catch {
      return false;
    }
  }
}
