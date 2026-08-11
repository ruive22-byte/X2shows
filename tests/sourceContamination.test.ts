import { describe, it, expect } from 'vitest';
import { SourceDiscoveryEngine } from '../src/services/resolvers/SourceDiscoveryEngine';
import { ProviderIdentityMapper } from '../src/services/resolvers/ProviderIdentityMapper';
import { TmdbAnimatedShow } from '../src/data/tmdbData';

describe('Source Contamination Test Matrix', () => {
  it('MUST REJECT Jake Long S02E04 playing South Park S03E07 (or any South Park)', async () => {
    const jakeLong: TmdbAnimatedShow = {
      id: "american-dragon-jake-long",
      tmdbId: 2190,
      title: "American Dragon: Jake Long",
      name: "American Dragon: Jake Long",
      media_type: "tv"
    } as any;

    const candidates = await SourceDiscoveryEngine.discover({ show: jakeLong, seasonNumber: 2, episodeNumber: 4 });
    
    for (const c of candidates) {
      const mappedId = ProviderIdentityMapper.getProviderMediaId(c.sourceProvider, "2190");
      expect(mappedId).not.toBe("2190");
      expect(c.url).not.toContain('/2190/');
      expect(c.providerMediaId).toBe("9753"); // the correct explicit mapping
    }
  });

  it('South Park S02E04 must never resolve using the Jake Long provider identity', async () => {
    const southPark: TmdbAnimatedShow = {
      id: "south-park",
      tmdbId: "south-park-mock-id", // using a mock id for South Park
      title: "South Park",
      media_type: "tv"
    } as any;

    const candidates = await SourceDiscoveryEngine.discover({ show: southPark, seasonNumber: 2, episodeNumber: 4 });
    
    const server1 = candidates.find(c => c.sourceProvider === 'server-1');
    expect(server1).toBeDefined();
    expect(server1!.providerMediaId).toBe('2190'); // The real TMDB ID of South Park
    expect(server1!.providerMediaId).not.toBe('9753'); // Must not use Jake Long's ID
  });

  it('Missing provider mapping must produce empty candidates or throw', async () => {
    const unknownShow: TmdbAnimatedShow = {
      id: "unknown-show",
      tmdbId: 999999,
      title: "Unknown",
      media_type: "tv"
    } as any;

    const candidates = await SourceDiscoveryEngine.discover({ show: unknownShow, seasonNumber: 1, episodeNumber: 1 });
    expect(candidates.length).toBe(0);
  });
});
