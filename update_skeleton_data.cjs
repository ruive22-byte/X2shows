const fs = require('fs');
let code = fs.readFileSync('src/data/skeletonData.ts', 'utf8');

code = code.replace(
  /export function transformTmdbShowToSkeletonCard/,
  "import { normalizeCatalogItem } from '../utils/normalizer';\n\nexport function transformTmdbShowToSkeletonCard"
);

code = code.replace(
  /return \{([\s\S]*?)\n\}/,
  `const baseItem = {$1\n  };\n  return normalizeCatalogItem(baseItem) as SkeletonCardItem;`
);

fs.writeFileSync('src/data/skeletonData.ts', code, 'utf8');
