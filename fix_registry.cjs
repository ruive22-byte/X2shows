const fs = require('fs');
let code = fs.readFileSync('src/services/catalog/catalogRegistry.ts', 'utf-8');
const start = code.indexOf('const validItems = validated.filter(Boolean) as CatalogItem[');
if (start !== -1) {
  const end = code.indexOf('];', start);
  if (end !== -1) {
    code = code.substring(0, start) + 'const validItems = validated.filter(Boolean) as CatalogItem[];' + code.substring(end + 2);
    fs.writeFileSync('src/services/catalog/catalogRegistry.ts', code);
    console.log('Fixed catalogRegistry.ts');
  } else {
    console.log('Could not find end of array');
  }
} else {
  console.log('Could not find start of array');
}
