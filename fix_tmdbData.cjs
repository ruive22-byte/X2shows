const fs = require('fs');

let code = fs.readFileSync('src/data/tmdbData.ts', 'utf-8');

// Replace '"description":' with '"overview":'
code = code.replace(/"description":/g, '"overview":');

// Replace '"navType": "Movie"' with '"navType": "Movies"'
code = code.replace(/"navType": "Movie"/g, '"navType": "Movies"');

fs.writeFileSync('src/data/tmdbData.ts', code);
console.log('Fixed tmdbData.ts');
