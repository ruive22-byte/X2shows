const fs = require('fs');
let code = fs.readFileSync('src/services/apiFallbackService.ts', 'utf8');

const startIdx = code.indexOf('export async function fetchShowWithFallback');
if (startIdx !== -1) {
  // Find the end of the file or next function, wait, it's at the end of the file.
  // Actually, I can just replace from startIdx to the end of the file.
  code = code.substring(0, startIdx);
  fs.writeFileSync('src/services/apiFallbackService.ts', code, 'utf8');
}
