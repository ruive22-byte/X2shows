import { TMDB_ANIMATED_CATALOG } from '../src/data/tmdbData';
import { SourceDiscoveryEngine } from '../src/services/resolvers/SourceDiscoveryEngine';

async function checkUrl(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    const contentType = res.headers.get('content-type') || 'unknown';
    return {
      status: res.status,
      contentType,
      isHTML: contentType.includes('text/html'),
      isManifest: contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('x-mpegURL') || contentType.includes('application/x-mpegURL'),
      isRedirect: res.status >= 300 && res.status < 400
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function diagnose() {
  const showName = 'American Dragon: Jake Long';
  const season = 2;
  const episode = 4;

  const show = TMDB_ANIMATED_CATALOG.find(s => s.name?.includes(showName) || s.title?.includes(showName));

  console.log(`REQUESTED:`);
  console.log(`show: ${showName}`);
  console.log(`season: ${season}`);
  console.log(`episode: ${episode}`);
  console.log(`TMDB ID: ${show?.tmdbId}`);
  console.log(`IMDb ID: ${show?.imdbId || 'N/A'}\n`);

  console.log(`DISCOVERY:`);
  console.log(`endpoint: Local SourceDiscoveryEngine`);
  console.log(`request parameters: showId=${show?.tmdbId}, season=${season}, episode=${episode}`);
  
  let candidates: any[] = [];
  try {
    candidates = await SourceDiscoveryEngine.discover({ show: show as any, seasonNumber: season, episodeNumber: episode });
  } catch (e) {}

  console.log(`response status: OK`);
  console.log(`candidate count: ${candidates.length}\n`);

  for (const c of candidates) {
    console.log(`CANDIDATES:`);
    console.log(`provider: ${c.sourceProvider}`);
    console.log(`provider media ID: ${c.providerMediaId}`);
    console.log(`discovery method: ${c.discoveryMethod}`);
    console.log(`source type: iframe/embed`);
    console.log(`URL type: absolute\n`);
    
    console.log(`PLAYBACK:`);
    console.log(`candidate: ${c.url}`);
    
    const check = await checkUrl(c.url);
    if ('error' in check) {
      console.log(`HTTP status: ERROR (${check.error})`);
      console.log(`content-type: N/A`);
      console.log(`redirect: N/A`);
      console.log(`manifest detected: false`);
      console.log(`player detected: false`);
      console.log(`playback result: FAILED\n`);
      
      console.log(`FAILURE:`);
      console.log(`exact candidate: ${c.url}`);
      console.log(`exact failure reason: Network Error or Blocked (${check.error})\n`);
    } else {
      console.log(`HTTP status: ${check.status}`);
      console.log(`content-type: ${check.contentType}`);
      console.log(`redirect: ${check.isRedirect}`);
      console.log(`manifest detected: ${check.isManifest}`);
      console.log(`player detected: ${check.isHTML}`);
      console.log(`playback result: ${check.isManifest ? 'SUCCESS' : 'FAILED'}\n`);
      
      console.log(`FAILURE:`);
      console.log(`exact candidate: ${c.url}`);
      if (check.isHTML) {
        console.log(`exact failure reason: URL returned HTML (iframe player), but requires direct stream extraction (M3U8/MP4) to be playable in a custom video player without embedding third-party DOM.\n`);
      } else {
        console.log(`exact failure reason: Missing stream extraction step.\n`);
      }
    }
  }
}

diagnose();
