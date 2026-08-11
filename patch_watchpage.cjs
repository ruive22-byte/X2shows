const fs = require('fs');
let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
code = code.replace(
  'const [currentTime, setCurrentTime] = useState<number>(120);',
  'const [currentTime, setCurrentTime] = useState<number>(0);'
);
fs.writeFileSync('src/components/WatchPage.tsx', code);
