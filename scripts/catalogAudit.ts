import { TMDB_ANIMATED_CATALOG } from '../src/data/tmdbData';
import fs from 'fs';

async function audit() {
  const report = [];
  const idMap = new Map();

  for (const show of TMDB_ANIMATED_CATALOG) {
    const showId = show.id;
    const tmdbId = show.tmdbId;
    
    let idStatus = 'OK';
    const detectedConflicts = [];

    if (idMap.has(tmdbId)) {
      idStatus = 'DUPLICATE_ID';
      detectedConflicts.push(`Shares tmdbId ${tmdbId} with ${idMap.get(tmdbId)}`);
    } else {
      idMap.set(tmdbId, show.title || show.name);
    }
    
    // Check known problematic ID 2190
    if (tmdbId === 2190 && (show.title || show.name) !== 'South Park') {
       idStatus = 'WRONG_ID_FOR_TITLE';
       detectedConflicts.push(`2190 is South Park, not ${show.title || show.name}`);
    }

    report.push({
      showId,
      title: show.title || show.name,
      canonicalId: tmdbId,
      idStatus,
      detectedConflicts,
      providerMappings: [
        { provider: "server-1", method: "tmdb-id" }
      ]
    });
  }

  fs.writeFileSync('catalogIntegrityReport.json', JSON.stringify(report, null, 2));
  console.log("Audit complete. Report written to catalogIntegrityReport.json");
}

audit().catch(console.error);
