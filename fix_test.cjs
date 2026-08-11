const fs = require('fs');
let code = fs.readFileSync('tests/streamExtraction.test.ts', 'utf-8');
code = code.replace(/url: "https:\/\/www\.w3\.org\/"/, 'url: "https://example.com/"');
fs.writeFileSync('tests/streamExtraction.test.ts', code);
