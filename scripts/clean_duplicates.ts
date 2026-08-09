import fs from 'fs';
import { TMDB_ANIMATED_CATALOG } from '../src/data/tmdbData';

console.log('Original catalog size:', TMDB_ANIMATED_CATALOG.length);

const map = new Map<string, typeof TMDB_ANIMATED_CATALOG[0]>();

for (const item of TMDB_ANIMATED_CATALOG) {
  const normTitle = (item.title || item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const media = item.mediaType || 'tv';
  const key = `${normTitle}_${media}`;

  if (!map.has(key)) {
    map.set(key, item);
  } else {
    const existing = map.get(key)!;
    // Keep the one with better tmdbId or posterUrl
    if ((!existing.tmdbId && item.tmdbId) || (item.posterUrl && !existing.posterUrl)) {
      map.set(key, { ...existing, ...item });
    }
  }
}

const cleaned = Array.from(map.values());
console.log('Cleaned catalog size:', cleaned.length);

const fileText = fs.readFileSync('src/data/tmdbData.ts', 'utf8');
const catIndex = fileText.indexOf('export const TMDB_ANIMATED_CATALOG');
const header = fileText.substring(0, catIndex);

const updatedText = header + 'export const TMDB_ANIMATED_CATALOG: TmdbAnimatedShow[] = ' + JSON.stringify(cleaned, null, 2) + ';\n';
fs.writeFileSync('src/data/tmdbData.ts', updatedText, 'utf8');
console.log('Successfully written cleaned tmdbData.ts!');
