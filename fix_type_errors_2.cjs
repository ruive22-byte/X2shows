const fs = require('fs');

let watch = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
watch = watch.replace(/useState<PlaybackHealth>\('unknown'\)/g, "useState<PlaybackHealth>('idle')");
watch = watch.replace(/checkedCandidate\.status === 'blocked'/g, "checkedCandidate.verification.playback === 'blocked'");
watch = watch.replace(/checkedCandidate\.status === 'failed'/g, "checkedCandidate.verification.playback === 'failed'");
watch = watch.replace(/playbackHealth === 'identity_mismatch'/g, "false");

fs.writeFileSync('src/components/WatchPage.tsx', watch);
