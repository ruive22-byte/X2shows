const fs = require('fs');
let code = fs.readFileSync('src/components/TmdbImage.tsx', 'utf8');

// Remove item from props interface
code = code.replace(/item\?: any;/g, '');

// Remove item from component params
code = code.replace(/item,/g, '');

// Remove the item block
code = code.replace(
  /\/\/ 0\. Use resolver if item is provided[\s\S]*?\}\n    \}/,
  ""
);

fs.writeFileSync('src/components/TmdbImage.tsx', code, 'utf8');
