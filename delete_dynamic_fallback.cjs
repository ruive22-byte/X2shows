const fs = require('fs');
let code = fs.readFileSync('src/services/tmdbApi.ts', 'utf8');

const startStr = '// Dynamic Search Fallback (TV Shows or Movies without Collection)';
const startIdx = code.indexOf(startStr);
if (startIdx !== -1) {
  const endIdx = code.indexOf('return null;\n}', startIdx);
  if (endIdx !== -1) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
    fs.writeFileSync('src/services/tmdbApi.ts', code, 'utf8');
    console.log("Deleted Dynamic Search Fallback");
  }
}
