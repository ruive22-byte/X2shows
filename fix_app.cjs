const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Change activeWatchShow initial episode/season to undefined if not provided
code = code.replace(/episodeNumber: episodeNumber \|\| 1/g, 'episodeNumber: episodeNumber');
code = code.replace(/seasonNumber: \(card as any\)\.season \|\| 1/g, 'seasonNumber: (card as any).season');

// Change WatchPage initial props to pass undefined instead of || 1
code = code.replace(/initialEpisodeNumber=\{activeWatchShow\.episodeNumber \|\| 1\}/g, 'initialEpisodeNumber={activeWatchShow.episodeNumber}');
code = code.replace(/initialSeasonNumber=\{activeWatchShow\.seasonNumber \|\| 1\}/g, 'initialSeasonNumber={activeWatchShow.seasonNumber}');

// Change onSelectShow
code = code.replace(/onSelectShow=\{\(nextShow\) => setActiveWatchShow\(\{ show: nextShow, episodeNumber: 1 \}\)\}/g, 'onSelectShow={(nextShow) => setActiveWatchShow({ show: nextShow })}');

fs.writeFileSync('src/App.tsx', code);
