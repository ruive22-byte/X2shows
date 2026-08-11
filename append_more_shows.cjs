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

async function addItemsToTmdbData(items) {
  const filePath = 'src/data/tmdbData.ts';
  let code = fs.readFileSync(filePath, 'utf-8');
  const entries = [];
  
  for (const {type, id} of items) {
    const data = await fetchTMDB(type, id);
    if (!data) continue;
    
    if (code.includes(`tmdbId: ${data.id}`) || code.includes(`"tmdbId": ${data.id}`)) {
      console.log(`Skipping ${data.name || data.title}, already in tmdbData.ts.`);
      continue;
    }
    
    const isMovie = type === 'movie';
    const entryId = isMovie ? `m-${data.id}` : `tv-${data.id}`;
    const name = data.title || data.name;
    const year = isMovie ? (data.release_date ? data.release_date.split('-')[0] : 'N/A') : (data.first_air_date ? data.first_air_date.split('-')[0] : 'N/A');
    
    let entry = `  {
    "id": "${entryId}",
    "tmdbId": ${data.id},
    "title": "${name.replace(/"/g, '\\"')}",
    "overview": "${(data.overview || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}",
    "release_date": "${year}",
    "posterUrl": "${data.poster_path}",
    "backdropUrl": "${data.backdrop_path}",
    "vote_average": ${data.vote_average ? data.vote_average.toFixed(1) : '8.0'},
    "genres": [${(data.genres || []).slice(0,3).map(g => `"${g.name}"`).join(', ')}],
    "media_type": "${type}",
    "mediaType": "${type}",
    "navType": "${isMovie ? 'Movies' : 'TV'}",
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
    }
  }
}

async function addItemsToRegistry(items) {
  const filePath = 'src/services/catalog/catalogRegistry.ts';
  let code = fs.readFileSync(filePath, 'utf-8');
  const entries = [];
  
  for (const {type, id} of items) {
    const data = await fetchTMDB(type, id);
    if (!data) continue;
    
    if (code.includes(`tmdbId: ${data.id}`) || code.includes(`"tmdbId": ${data.id}`)) {
      console.log(`Skipping ${data.name || data.title}, already in catalogRegistry.ts.`);
      continue;
    }
    
    const isMovie = type === 'movie';
    const itemType = isMovie ? 'Movie' : 'TV Show';
    const entryId = isMovie ? `m-${data.id}` : `tv-${data.id}`;
    const name = data.title || data.name;
    const year = isMovie ? (data.release_date ? data.release_date.split('-')[0] : 'N/A') : (data.first_air_date ? data.first_air_date.split('-')[0] : 'N/A');
    
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
      seasons: ${isMovie ? 0 : (data.number_of_seasons || 1)},
      studio: '${(data.production_companies && data.production_companies.length > 0) ? data.production_companies[0].name.replace(/"/g, '\\"') : 'Unknown'}',
      addedAt: Date.now()
    },`;
    entries.push(entry);
  }
  
  if (entries.length > 0) {
    const searchString = 'const validItems = validated.filter(Boolean) as CatalogItem[];';
    const startIndex = code.indexOf(searchString);
    if (startIndex !== -1) {
      // Find the end of the array that comes shortly after
      // The array is `  ];`
      const arrayEndIndex = code.indexOf('  ];', startIndex);
      if (arrayEndIndex !== -1) {
         code = code.substring(0, arrayEndIndex) + entries.join('\n') + '\n  ];' + code.substring(arrayEndIndex + 4);
         fs.writeFileSync(filePath, code);
         console.log(`Added ${entries.length} items to ${filePath}`);
      }
    } else {
        // If the array structure is different
        const altStart = code.indexOf('const validItems = validated.filter(Boolean) as CatalogItem[]');
        if (altStart !== -1) {
            const arrayEndIndex = code.indexOf('  ];', altStart);
            if (arrayEndIndex !== -1) {
                 code = code.substring(0, arrayEndIndex) + entries.join('\n') + '\n  ];' + code.substring(arrayEndIndex + 4);
                 fs.writeFileSync(filePath, code);
                 console.log(`Added ${entries.length} items to ${filePath}`);
            }
        }
    }
  }
}

const urls = [
  "https://www.themoviedb.org/tv/3072-stripperella?language=en-US",
  "https://www.themoviedb.org/tv/1977-loonatics-unleashed?language=en-US",
  "https://www.themoviedb.org/tv/2342-clone-high?language=en-US",
  "https://www.themoviedb.org/tv/132-fantastic-four-world-s-greatest-heroes?language=en-US",
  "https://www.themoviedb.org/tv/95775-nate-is-late?language=en-US",
  "https://www.themoviedb.org/tv/4508-the-zeta-project?language=en-US",
  "https://www.themoviedb.org/tv/60789-monsters-vs-aliens?language=en-US",
  "https://www.themoviedb.org/tv/64931-pig-goat-banana-cricket?language=en-US",
  "https://www.themoviedb.org/tv/3793-invader-zim?language=en-US",
  "https://www.themoviedb.org/tv/1763-braceface?language=en-US",
  "https://www.themoviedb.org/tv/55924-camp-lakebottom?language=en-US",
  "https://www.themoviedb.org/tv/200753-kite-man-hell-yeah?language=en-US",
  "https://www.themoviedb.org/tv/123548-castlevania-nocturne?language=en-US",
  "https://www.themoviedb.org/tv/61119-the-7d?language=en-US",
  "https://www.themoviedb.org/tv/1618-justice-league?language=en-US",
  "https://www.themoviedb.org/tv/21781-the-super-hero-squad-show?language=en-US",
  "https://www.themoviedb.org/tv/9921-back-at-the-barnyard?language=en-US",
  "https://www.themoviedb.org/tv/657-rocko-s-modern-life?language=en-US",
  "https://www.themoviedb.org/tv/557-camp-lazlo?language=en-US",
  "https://www.themoviedb.org/tv/18828-t-u-f-f-puppy?language=en-US",
  "https://www.themoviedb.org/tv/127706-kiff?language=en-US",
  "https://www.themoviedb.org/tv/1346-wow-wow-wubbzy?language=en-US",
  "https://www.themoviedb.org/tv/31499-fish-hooks?language=en-US",
  "https://www.themoviedb.org/tv/4336-drawn-together?language=en-US",
  "https://www.themoviedb.org/tv/27318-breadwinners?language=en-US",
  "https://www.themoviedb.org/tv/504-the-ren-stimpy-show?language=en-US",
  "https://www.themoviedb.org/tv/32605-the-looney-tunes-show?language=en-US",
  "https://www.themoviedb.org/tv/1720-foster-s-home-for-imaginary-friends?language=en-US",
  "https://www.themoviedb.org/tv/118546-clone-high?language=en-US",
  "https://www.themoviedb.org/tv/4585-tripping-the-rift?language=en-US",
  "https://www.themoviedb.org/tv/1126-happy-tree-friends?language=en-US",
  "https://www.themoviedb.org/tv/33217-young-justice?language=en-US",
  "https://www.themoviedb.org/tv/56210-high-school-usa?language=en-US"
];

const items = urls.map(url => {
  const match = url.match(/(movie|tv)\/(\d+)/);
  if (match) {
    return { type: match[1], id: parseInt(match[2], 10) };
  }
  return null;
}).filter(Boolean);

(async () => {
  console.log('Adding items to tmdbData.ts...');
  await addItemsToTmdbData(items);
  console.log('Adding items to catalogRegistry.ts...');
  await addItemsToRegistry(items);
})();
