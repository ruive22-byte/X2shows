const fs = require('fs');

let diag = fs.readFileSync('src/components/DiagnosticPanel.tsx', 'utf-8');
diag = diag.replace("activeCandidate?.confidence", "activeCandidate?.score");
fs.writeFileSync('src/components/DiagnosticPanel.tsx', diag);

let watch = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
watch = watch.replace(/setPlaybackHealth\('unknown'\)/g, "setPlaybackHealth('idle')");
watch = watch.replace(/candidate\.status === 'blocked'/g, "candidate.verification.playback === 'blocked'");
watch = watch.replace(/candidate\.status === 'failed'/g, "candidate.verification.playback === 'failed'");
watch = watch.replace(/playbackHealth !== 'identity_mismatch'/g, "true");
watch = watch.replace(/playbackHealth === 'unknown'/g, "playbackHealth === 'idle'");
watch = watch.replace(/setPlaybackHealth\('identity_mismatch'\)/g, "setPlaybackHealth('failed')");

fs.writeFileSync('src/components/WatchPage.tsx', watch);
