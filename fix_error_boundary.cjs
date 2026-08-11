const fs = require('fs');
let code = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');

code = code.replace(
  '<div className="p-6 text-center bg-[#07151e] text-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000]">',
  '<div className="w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-[#040a0f]"><div className="p-8 text-center bg-[#07151e] text-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] max-w-lg w-full">'
);
code = code.replace(
  'Reload Page\n          </button>\n        </div>',
  'Reload Page\n          </button>\n        </div></div>'
);

fs.writeFileSync('src/components/ErrorBoundary.tsx', code);
console.log('Fixed ErrorBoundary style');
