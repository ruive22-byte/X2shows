const fs = require('fs');
let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
code = code.replace(
  'const handleServerChange = (serverId: string) => {',
  `const handleServerChange = (serverId: string) => {
    if (orchestratedMedia) {
      const candidate = orchestratedMedia.streamCandidates.find(c => c.sourceProvider === serverId);
      if (candidate) {
        setActiveStreamUrl(candidate.url);
        setStreamCandidate(candidate);
      }
    }`
);
fs.writeFileSync('src/components/WatchPage.tsx', code);
