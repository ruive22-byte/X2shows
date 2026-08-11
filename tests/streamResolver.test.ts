import { StreamResolver, ProviderHealthRegistry } from '../src/services/resolvers/StreamResolver';
import { TMDB_ANIMATED_CATALOG } from '../src/data/tmdbData';

// Mock localStorage
const store: any = {};
global.localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => {}
} as any;

async function run() {
  const show = TMDB_ANIMATED_CATALOG[0];
  
  const candidates = await StreamResolver.getCandidates(show, 1, 1);
  console.log("PASS: Candidates generated:", candidates.length);

  const bestProvider = candidates[0].sourceProvider;
  ProviderHealthRegistry.updateHealth(bestProvider, { attempts: 10, failures: 10 });
  
  const sortedCandidates = await StreamResolver.getCandidates(show, 1, 1);
  
  if (sortedCandidates[0].sourceProvider !== bestProvider) {
     console.log("PASS: Health penalty properly downgraded candidate");
  } else {
     console.error("FAIL: Health penalty did not downgrade candidate");
  }
}

run();
