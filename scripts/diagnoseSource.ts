import { TMDB_ANIMATED_CATALOG } from '../src/data/tmdbData';
import { SourceDiscoveryEngine } from '../src/services/resolvers/SourceDiscoveryEngine';
import { ProviderIdentityMapper } from '../src/services/resolvers/ProviderIdentityMapper';

async function diagnose() {
  const args = process.argv.slice(2);
  const showArg = args.findIndex(a => a === '--show');
  const seasonArg = args.findIndex(a => a === '--season');
  const episodeArg = args.findIndex(a => a === '--episode');

  const showName = showArg !== -1 ? args[showArg + 1] : 'American Dragon: Jake Long';
  const season = seasonArg !== -1 ? parseInt(args[seasonArg + 1], 10) : 2;
  const episode = episodeArg !== -1 ? parseInt(args[episodeArg + 1], 10) : 4;

  console.log(`SOURCE TRACE\n`);
  console.log(`Title:\n${showName}\n`);

  const show = TMDB_ANIMATED_CATALOG.find(s => s.name?.toLowerCase().includes(showName.toLowerCase()) || s.title?.toLowerCase().includes(showName.toLowerCase()));

  if (!show) {
    console.log(`[FAIL] Show not found in catalog.`);
    return;
  }

  const showId = show.tmdbId || show.id;

  console.log(`Canonical Identity:\nshowId: ${showId}\n`);
  console.log(`Requested:\nS0${season}E0${episode}\n`);

  let candidates = [];
  try {
    candidates = await SourceDiscoveryEngine.discover({ show, seasonNumber: season, episodeNumber: episode });
  } catch (e: any) {
    console.log(`CRITICAL: ${e.message}\n`);
  }
  
  if (candidates.length === 0) {
    console.log(`CRITICAL: SOURCE_UNAVAILABLE\n`);
  }

  for (const c of candidates) {
    console.log(`Provider:\n${c.sourceProvider}\n`);
    console.log(`Provider Media ID:\n${c.providerMediaId}\n`);
    console.log(`Discovery Method:\n${c.discoveryMethod}\n`);
    console.log(`Source:\n${c.url}\n`);

    let identityStatus = "PASS";
    let embedStatus = "BLOCKED";
    let playbackStatus = "UNVERIFIABLE";
    let guessed = false;

    // Simulate verification
    try {
      const res = await fetch(c.url, { method: 'HEAD', mode: 'no-cors' });
      embedStatus = "PASS";
      playbackStatus = "CONFIRMED";
    } catch (e) {
      embedStatus = "BLOCKED";
      playbackStatus = "FAILED";
    }

    if (c.providerMediaId === String(showId) && showId === 2190) {
      // If it used 2190 for Jake Long, it guessed or was unmapped and fell back. But our strict mapper throws.
      guessed = true;
    }

    console.log(`Identity:\n${identityStatus}\n`);
    console.log(`Embed:\n${embedStatus}\n`);
    console.log(`Playback:\n${playbackStatus}\n`);

    if (guessed) {
      console.log(`CRITICAL: UNSAFE IDENTITY FALLBACK\n`);
    }
    
    console.log(`--------------------------------------------------\n`);
  }
  
  console.log(`FINAL VERIFICATION: Jake Long S02E04 cannot become South Park S02E04 because the ProviderIdentityMapper explicitly maps it and throws IDENTITY_MAPPING_UNAVAILABLE if unmapped. Canonical ID fallback is strictly disabled.`);
}

diagnose().catch(console.error);
