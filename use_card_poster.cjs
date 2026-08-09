const fs = require('fs');
let code = fs.readFileSync('src/components/ShowCard.tsx', 'utf8');

code = code.replace(
  /import \{ TmdbImage \} from '\.\/TmdbImage';/,
  "import { CardPoster } from './CardPoster';"
);

code = code.replace(
  /<TmdbImage[\s\S]*?className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out"[\s\S]*?\/>/,
  `<CardPoster 
          item={show} 
          alt={displayTitle} 
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out" 
        />`
);

fs.writeFileSync('src/components/ShowCard.tsx', code, 'utf8');
