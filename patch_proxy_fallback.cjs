const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const fallbackCode = `
function getFallbackEpisodes(path) {
  const match = path.match(/\\/tv\\/(\\d+)\\/season\\/(\\d+)/);
  if (match) {
    const season = parseInt(match[2], 10);
    const episodes = Array.from({length: 24}, (_, i) => ({
      id: parseInt(\`\${match[1]}\${season}\${i+1}\`),
      episode_number: i + 1,
      season_number: season,
      name: \`Episode \${i + 1}\`,
      overview: 'Fallback episode overview.',
      air_date: '2024-01-01',
      still_path: null,
      runtime: 24
    }));
    return { episodes };
  }
  return null;
}
`;

if (!code.includes('getFallbackEpisodes')) {
  code = code.replace("app.get('/api/tmdb/proxy', async (req, res) => {", fallbackCode + "\n  app.get('/api/tmdb/proxy', async (req, res) => {");
}

code = code.replace(
  /if \(!tmdbKey\) \{[\s\S]*?return res\.status\(500\)\.json\(\{ success: false, error: 'TMDB_API_KEY not configured on server' \}\);\s*\}/,
  `if (!tmdbKey) {
        const fallback = getFallbackEpisodes(path);
        if (fallback) return res.json(fallback);
        return res.status(500).json({ success: false, error: 'TMDB_API_KEY not configured on server' });
      }`
);

code = code.replace(
  /if \(!tmdbRes\.ok\) \{\s*return res\.status\(tmdbRes\.status\)\.json\(\{ success: false, error: data\.status_message \|\| 'TMDB Proxy Error' \}\);\s*\}/,
  `if (!tmdbRes.ok) {
        const fallback = getFallbackEpisodes(path);
        if (fallback) return res.json(fallback);
        return res.status(tmdbRes.status).json({ success: false, error: data.status_message || 'TMDB Proxy Error' });
      }`
);

fs.writeFileSync('server.ts', code);
