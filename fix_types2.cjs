const fs = require('fs');

let dp = fs.readFileSync('src/components/DiagnosticPanel.tsx', 'utf-8');
dp = dp.replace(/activeCandidate\?\.providerId/g, 'activeCandidate?.sourceProvider');
dp = dp.replace(/activeCandidate\?\.score/g, 'activeCandidate?.providerHealthScore');
fs.writeFileSync('src/components/DiagnosticPanel.tsx', dp);

let wp = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
wp = wp.replace(/checkedCandidate\.verification\.playback === 'failed'/g, 'checkedCandidate.verificationStatus === "FAILED"');
fs.writeFileSync('src/components/WatchPage.tsx', wp);

