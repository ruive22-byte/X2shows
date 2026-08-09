const fs = require('fs');
let code = fs.readFileSync('src/services/apiFallbackService.ts', 'utf8');

if (!code.includes("import { normalizeCatalogItem }")) {
  code = code.replace(
    /import \{ resolvePoster, resolveBackdrop \} from '\.\.\/utils\/posterResolver';/,
    "import { resolvePoster, resolveBackdrop } from '../utils/posterResolver';\nimport { normalizeCatalogItem } from '../utils/normalizer';"
  );
}

code = code.replace(
  /rawData\.resolvedPosterUrl = resolvePoster\(rawData as any\);\n  rawData\.posterUrl = rawData\.resolvedPosterUrl \|\| rawData\.posterUrl;\n  \n  return rawData;/,
  "return normalizeCatalogItem(rawData);"
);

fs.writeFileSync('src/services/apiFallbackService.ts', code, 'utf8');
