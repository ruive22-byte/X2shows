const fs = require('fs');

async function fetchTMDB(type, id) {
  const apiKey = process.env.VITE_TMDB_API_KEY || '102ed1918349540bde96053f3e1a6c42';
  const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch ${type} ${id}:`, res.status);
    return null;
  }
  const data = await res.json();
  return { ...data, media_type: type };
}

async function addItems(items) {
  const filePath = 'src/data/tmdbData.ts';
  let code = fs.readFileSync(filePath, 'utf-8');
  
  const entries = [];
  
  for (const {type, id} of items) {
    console.log(`Fetching ${type} ${id}...`);
    const data = await fetchTMDB(type, id);
    if (!data) continue;
    
    if (code.includes(`tmdbId: ${data.id}`) || code.includes(`"tmdbId": ${data.id}`)) {
      console.log(`Skipping ${data.name || data.title}, already exists.`);
      continue;
    }
    
    const isMovie = type === 'movie';
    const entryId = isMovie ? `m-${data.id}` : `tv-${data.id}`;
    const name = data.title || data.name;
    const year = isMovie ? (data.release_date ? data.release_date.split('-')[0] : 'N/A') : (data.first_air_date ? data.first_air_date.split('-')[0] : 'N/A');
    
    // We map to TmdbAnimatedShow
    let entry = `  {
    "id": "${entryId}",
    "tmdbId": ${data.id},
    "title": "${name.replace(/"/g, '\\"')}",
    "description": "${(data.overview || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}",
    "year": "${year}",
    "posterUrl": "${data.poster_path}",
    "backdropUrl": "${data.backdrop_path}",
    "rating": ${data.vote_average ? data.vote_average.toFixed(1) : '8.0'},
    "genreTags": [${(data.genres || []).slice(0,3).map(g => `"${g.name}"`).join(', ')}],
    "media_type": "${type}",
    "mediaType": "${type}",
    "navType": "${isMovie ? 'Movie' : 'TV'}",
    "category": "Newly Added",
    "seasonCount": ${isMovie ? 0 : (data.number_of_seasons || 1)},
    "totalEpisodes": ${isMovie ? 1 : (data.number_of_episodes || 10)},
    "durationMinutes": ${isMovie ? (data.runtime || 120) : (data.episode_run_time?.[0] || 22)},
    "studio": "${(data.production_companies && data.production_companies.length > 0) ? data.production_companies[0].name.replace(/"/g, '\\"') : 'Unknown'}",
    "qualityBadges": ["HD"],
    "matchScore": ${Math.floor(Math.random() * 20) + 80},
    "isNewlyAdded": true
  }`;
    entries.push(entry);
  }
  
  if (entries.length > 0) {
    const insertionPoint = code.lastIndexOf('];');
    if (insertionPoint !== -1) {
      code = code.substring(0, insertionPoint) + ',\n' + entries.join(',\n') + '\n];\n';
      fs.writeFileSync(filePath, code);
      console.log(`Added ${entries.length} items to ${filePath}`);
    } else {
      console.error("Could not find insertion point in " + filePath);
    }
  }
}

const items = [
  {type: 'movie', id: 129},
  {type: 'movie', id: 372058},
  {type: 'movie', id: 4935},
  {type: 'movie', id: 128},
  {type: 'movie', id: 503314},
  {type: 'movie', id: 568160},
  {type: 'movie', id: 378064},
  {type: 'tv', id: 7869},
  {type: 'tv', id: 65763},
  {type: 'tv', id: 2085},
  {type: 'tv', id: 34391},
  {type: 'tv', id: 72705},
  {type: 'tv', id: 1269},
  {type: 'tv', id: 3854},
  {type: 'tv', id: 3611},
  {type: 'tv', id: 204024},
  {type: 'tv', id: 45013},
  {type: 'tv', id: 1567},
  {type: 'tv', id: 68837},
  {type: 'tv', id: 4028},
  {type: 'tv', id: 63181}
];

addItems(items);
