const fs = require('fs');

const filesToUpdate = [
  'src/components/ShowCard.tsx',
  'src/components/HeroCarousel.tsx',
  'src/components/ContinueWatchingRow.tsx',
  'src/components/HeaderNav.tsx',
  'src/components/WatchlistView.tsx',
  'src/components/ShowDetailPage.tsx',
  'src/components/SearchResultsFilterView.tsx',
  'src/components/HeroBillboardSkeleton.tsx',
  'src/components/ShowDetailModal.tsx',
  'src/components/SkeletonCard.tsx',
  'src/components/SkeletonDrawerModal.tsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace import back
  if (code.includes("import { CardPoster } from './CardPoster';")) {
    code = code.replace(
      /import \{ CardPoster \} from '\.\/CardPoster';/g,
      "import { TmdbImage } from './TmdbImage';"
    );
  } else if (code.includes("import { CardPoster }")) {
    code = code.replace(/CardPoster/g, 'TmdbImage');
  }

  code = code.replace(/<CardPoster/g, '<TmdbImage');
  code = code.replace(/<\/CardPoster>/g, '</TmdbImage>');

  fs.writeFileSync(file, code, 'utf8');
});
