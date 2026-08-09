const fs = require('fs');
let code = fs.readFileSync('src/services/tmdbApi.ts', 'utf8');

code = code.replace(
  /import \{ resolvePoster, resolveBackdrop \} from '\.\.\/utils\/posterResolver';/,
  "import { resolvePoster, resolveBackdrop } from '../utils/posterResolver';\nimport { normalizeCatalogItem } from '../utils/normalizer';"
);

code = code.replace(
  /export function transformRawTmdbMedia\(raw: RawTmdbMedia, mediaType: 'tv' \| 'movie', pageIndex: number = 1\): TmdbAnimatedShow \{([\s\S]*?)return \{([\s\S]*?)\};\n\}/,
  `export function transformRawTmdbMedia(raw: RawTmdbMedia, mediaType: 'tv' | 'movie', pageIndex: number = 1): TmdbAnimatedShow {$1
  const baseItem = {$2};
  return normalizeCatalogItem(baseItem) as TmdbAnimatedShow;
}`
);

fs.writeFileSync('src/services/tmdbApi.ts', code, 'utf8');
