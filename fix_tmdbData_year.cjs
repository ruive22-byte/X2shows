const fs = require('fs');
let code = fs.readFileSync('src/data/tmdbData.ts', 'utf-8');
code = code.replace(/"year": /g, '"release_date": ');
fs.writeFileSync('src/data/tmdbData.ts', code);
console.log('Fixed year in tmdbData.ts');
