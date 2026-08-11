const fs = require('fs');
let code = fs.readFileSync('src/services/seasonFetcherService.ts', 'utf-8');
code = code.replace(
  "const response = await fetch(url);",
  "const response = await fetch(url);\n      if (!response.ok) { const txt = await response.text(); console.error('TMDB Proxy failed:', response.status, txt); }"
);
fs.writeFileSync('src/services/seasonFetcherService.ts', code);
