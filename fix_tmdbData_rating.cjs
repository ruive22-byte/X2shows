const fs = require('fs');
let code = fs.readFileSync('src/data/tmdbData.ts', 'utf-8');
code = code.replace(/"rating": /g, '"vote_average": ');
code = code.replace(/"genreTags": /g, '"genres": ');
fs.writeFileSync('src/data/tmdbData.ts', code);
console.log('Fixed rating in tmdbData.ts');
