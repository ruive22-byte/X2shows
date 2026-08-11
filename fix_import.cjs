const fs = require('fs');

let watch = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
watch = "import { assertIdentity, ContentIdentityMismatchError } from '../services/resolvers/ContentIdentityValidator';\n" + watch;
fs.writeFileSync('src/components/WatchPage.tsx', watch);
