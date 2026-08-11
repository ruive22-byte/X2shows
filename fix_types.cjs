const fs = require('fs');

// DiagnosticPanel.tsx
let dp = fs.readFileSync('src/components/DiagnosticPanel.tsx', 'utf-8');
dp = dp.replace(/c\.providerId/g, 'c.sourceProvider');
dp = dp.replace(/c\.score/g, 'c.providerHealthScore');
dp = dp.replace(/c\.verification\.playback/g, 'c.verificationStatus');
fs.writeFileSync('src/components/DiagnosticPanel.tsx', dp);

// WatchPage.tsx
let wp = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
wp = wp.replace(/candidate\.identity/g, 'candidate.requestedIdentity');
wp = wp.replace(/checkedCandidate\.verification\.embedAllowed === false/g, 'checkedCandidate.verificationStatus === "EMBED_BLOCKED"');
wp = wp.replace(/checkedCandidate\.verification\.playback === "failed"/g, 'checkedCandidate.verificationStatus === "FAILED"');
fs.writeFileSync('src/components/WatchPage.tsx', wp);

// tests/streamResolver.test.ts (if exists)
try {
  let ts = fs.readFileSync('tests/streamResolver.test.ts', 'utf-8');
  ts = ts.replace(/providerId/g, 'sourceProvider');
  fs.writeFileSync('tests/streamResolver.test.ts', ts);
} catch (e) {}

