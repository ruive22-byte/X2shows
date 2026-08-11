const fs = require('fs');
let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');

// The bottom controls container starts with <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#03090d] to-transparent flex flex-col justify-end">
code = code.replace(
  '<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#03090d] to-transparent flex flex-col justify-end">',
  '<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#03090d] to-transparent flex flex-col justify-end pointer-events-none opacity-0 hover:opacity-100 transition-opacity z-50">'
);

// We need to re-enable pointer events on the buttons themselves if they want to click them, but they can't control the iframe anyway.
// It's better to just leave it as opacity-0 to not block the iframe, and if they hover the bottom, they can see our controls.

fs.writeFileSync('src/components/WatchPage.tsx', code);
