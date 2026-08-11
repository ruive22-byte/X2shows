const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.scripts['diagnose:source'] = 'tsx scripts/diagnoseSource.ts';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
