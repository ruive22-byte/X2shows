const fs = require('fs');

let code = fs.readFileSync('src/components/SearchResultsFilterView.tsx', 'utf-8');

code = code.replace(/setSelectedFormats\(\s*prev\s*=>\s*\{[\s\S]*?return next;\s*\}\);/g, `const isSelected = selectedFormats.includes(fmt);
    const next = isSelected ? selectedFormats.filter(f => f !== fmt) : [...selectedFormats, fmt];
    setSelectedFormats(next);
    onShowToast(!isSelected ? \`Added format filter: \${fmt}\` : \`Removed format filter: \${fmt}\`);`);

code = code.replace(/setSelectedTags\(\s*prev\s*=>\s*\{[\s\S]*?return next;\s*\}\);/g, `const isSelected = selectedTags.includes(tag);
    const next = isSelected ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag];
    setSelectedTags(next);
    onShowToast(!isSelected ? \`Added tag filter: #\${tag}\` : \`Removed tag filter: #\${tag}\`);`);

code = code.replace(/setSelectedGenres\(\s*prev\s*=>\s*\{[\s\S]*?return next;\s*\}\);/g, `const isSelected = selectedGenres.includes(genre);
    const next = isSelected ? selectedGenres.filter(g => g !== genre) : [...selectedGenres, genre];
    setSelectedGenres(next);
    onShowToast(!isSelected ? \`Added genre filter: \${genre}\` : \`Removed genre filter: \${genre}\`);`);

fs.writeFileSync('src/components/SearchResultsFilterView.tsx', code);
