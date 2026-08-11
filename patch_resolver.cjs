const fs = require('fs');
let code = fs.readFileSync('src/services/resolvers/StreamResolver.ts', 'utf-8');
code = code.replace(
  'const res = await fetch(`/api/resolve/embed-check?url=${encodeURIComponent(candidate.url)}`);',
  'candidate.verificationStatus = "UNVERIFIED"; return candidate; // Bypass Cloudflare blocked server-side checks'
);
fs.writeFileSync('src/services/resolvers/StreamResolver.ts', code);
