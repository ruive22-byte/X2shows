const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  "app.get('/api/tmdb/proxy', async (req, res) => {",
  "app.get('/api/tmdb/proxy', async (req, res) => { console.log('HIT /api/tmdb/proxy', req.query.path);"
);
fs.writeFileSync('server.ts', code);
