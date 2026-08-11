const fs = require('fs');

let watch = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
watch = watch.replace(/checkedCandidate\.verification\.playback === 'blocked' \|\| /g, "");

fs.writeFileSync('src/components/WatchPage.tsx', watch);
