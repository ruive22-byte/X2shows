const fs = require('fs');
let code = fs.readFileSync('src/data/tmdbData.ts', 'utf-8');

// Update the interface to include vote_average
code = code.replace(/rating: number; status\?: string \}\[\];/g, 'rating?: number; vote_average?: number; status?: string }[];');

fs.writeFileSync('src/data/tmdbData.ts', code);
console.log('Fixed interface in tmdbData.ts');
