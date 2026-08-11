import { describe, it, expect } from 'vitest';
import { StreamExtractor } from '../src/services/resolvers/StreamExtractor';
import { StreamCandidate } from '../src/services/resolvers/SourceDiscoveryEngine';

describe('StreamExtractor Architectural Stage', () => {
  it('MUST identify when an embed URL returns HTML instead of a media manifest', async () => {
    const mockCandidate: StreamCandidate = {
      id: "test",
      url: "https://example.com/", // Using a public HTML page to simulate an embed response
      sourceProvider: "test-provider",
      discoveryMethod: "url-template",
      requestedIdentity: { showId: '1', title: 'Test', type: 'tv' },
      discoveredAt: Date.now(),
      identityConfidence: 1,
      providerHealthScore: 100,
      verificationStatus: 'UNVERIFIED',
      server: null as any
    };

    const result = await StreamExtractor.extract(mockCandidate);
    
    // We expect it to successfully process the HTML but fail to find a media stream
    expect(result.success).toBe(false);
    expect(result.error).toBe('NO_PLAYABLE_STREAMS_FOUND_IN_EMBED');
    expect(result.streams.length).toBe(0);
  });

  // Example mocking a page that does contain an M3U8 string
  it('MUST extract a manifest URL if present in the HTML', async () => {
    // We will patch fetch just for this test
    const originalFetch = global.fetch;
    
    global.fetch = async () => {
      return {
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body><script>var src="https://cdn.example.com/playlist.m3u8";</script></body></html>'
      } as any;
    };

    const mockCandidate: StreamCandidate = {
      id: "test2",
      url: "https://mock-embed.com/",
      sourceProvider: "test-provider",
      discoveryMethod: "url-template",
      requestedIdentity: { showId: '1', title: 'Test', type: 'tv' },
      discoveredAt: Date.now(),
      identityConfidence: 1,
      providerHealthScore: 100,
      verificationStatus: 'UNVERIFIED',
      server: null as any
    };

    try {
      const result = await StreamExtractor.extract(mockCandidate);
      
      expect(result.success).toBe(true);
      expect(result.streams.length).toBe(1);
      expect(result.streams[0].url).toBe('https://cdn.example.com/playlist.m3u8');
      expect(result.streams[0].type).toBe('hls');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
