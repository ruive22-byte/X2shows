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
  
  // Replace import
  if (code.includes("import { TmdbImage } from './TmdbImage';")) {
    code = code.replace(
      /import \{ TmdbImage \} from '\.\/TmdbImage';/g,
      "import { CardPoster } from './CardPoster';"
    );
  } else if (code.includes("import { TmdbImage }")) {
    code = code.replace(/TmdbImage/g, 'CardPoster');
  }

  // Very naive replacement of TmdbImage component name.
  // The actual props of TmdbImage are different from CardPoster.
  // CardPoster expects item={item} and alt={string} className={string} fallbackPlaceholder={ReactNode}
  
  // This is a complex replacement. Let's look at one file at a time.
  fs.writeFileSync(file, code, 'utf8');
});
