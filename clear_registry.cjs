const fs = require('fs');

let code = fs.readFileSync('src/services/apiFallbackService.ts', 'utf8');

const regex = /export const VERIFIED_ANIMATION_ARTWORK[^]+?\n\};/m;
code = code.replace(regex, "export const VERIFIED_ANIMATION_ARTWORK: Record<string, { poster: string; backdrop: string }> = {};");

fs.writeFileSync('src/services/apiFallbackService.ts', code, 'utf8');
