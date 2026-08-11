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
  const filePath = 'src/services/catalog/catalogRegistry.ts';
  let code = fs.readFileSync(filePath, 'utf-8');
  
  const entries = [];
  
  for (const {type, id} of items) {
    console.log(`Fetching ${type} ${id}...`);
    const data = await fetchTMDB(type, id);
    if (!data) continue;
    
    if (code.includes(`id: '${type === 'movie' ? 'm' : 'tv'}-${data.id}'`) || code.includes(`tmdbId: ${data.id}`)) {
      console.log(`Skipping ${data.name || data.title}, already exists.`);
      continue;
    }
    
    const itemType = type === 'movie' ? 'Movie' : 'TV Show';
    const entryId = type === 'movie' ? `m-${data.id}` : `tv-${data.id}`;
    const name = data.title || data.name;
    const year = type === 'movie' ? (data.release_date ? data.release_date.split('-')[0] : 'N/A') : (data.first_air_date ? data.first_air_date.split('-')[0] : 'N/A');
    
    let entry = `    {
      id: '${entryId}',
      tmdbId: ${data.id},
      title: "${name.replace(/"/g, '\\"')}",
      type: '${type}',
      genres: [${(data.genres || []).slice(0,3).map(g => `'${g.name}'`).join(', ')}],
      format: '${itemType}',
      year: '${year}',
      posterUrl: '${data.poster_path}',
      backdropUrl: '${data.backdrop_path}',
      rating: ${data.vote_average ? data.vote_average.toFixed(1) : '8.0'},
      description: "${(data.overview || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}",
      status: '${data.status || 'Released'}',
      seasons: ${type === 'tv' ? (data.number_of_seasons || 1) : 0},
      studio: '${(data.production_companies && data.production_companies.length > 0) ? data.production_companies[0].name.replace(/"/g, '\\"') : 'Unknown'}',
      addedAt: Date.now()
    },`;
    entries.push(entry);
  }
  
  if (entries.length > 0) {
    // Find the end of the predefinedCatalog array
    // Since it ends with "  ];", we replace "];" with our items + "];"
    // However, it's safer to just replace the last bracket before closing the array.
    const insertionPoint = code.lastIndexOf('];');
    if (insertionPoint !== -1) {
      code = code.substring(0, insertionPoint) + entries.join('\n') + '\n  ' + code.substring(insertionPoint);
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
