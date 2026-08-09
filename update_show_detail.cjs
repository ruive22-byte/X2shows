const fs = require('fs');
let code = fs.readFileSync('src/components/ShowDetailPage.tsx', 'utf8');

code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('collection'\)\}\s+className=\{`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs sm:text-sm transition-all cursor-pointer shadow-\[2px_2px_0px_#000000\] flex items-center gap-2 shrink-0 \$\{\s+activeTab === 'collection'\s+\? 'bg-\[#14b8a6\] text-black scale-105'\s+: 'bg-\[#07151e\] text-\[#99f6e4\] hover:bg-\[#0d2836\]'\s+\}`\}\s+>\s+<Layers className="w-4 h-4" \/>\s+<span>FRANCHISE & UNIVERSE SAGA \(\{franchise\.items\.length\}\)<\/span>\s+<\/button>/g,
  `{franchise && (
          <button
            onClick={() => setActiveTab('collection')}
            className={\`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs sm:text-sm transition-all cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center gap-2 shrink-0 \${
              activeTab === 'collection'
                ? 'bg-[#14b8a6] text-black scale-105'
                : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
            }\`}
          >
            <Layers className="w-4 h-4" />
            <span>FRANCHISE & UNIVERSE SAGA ({franchise.items.length})</span>
          </button>
          )}`
);

// We must also handle the display of the collection content below
code = code.replace(
  /<section id="franchise-collection-section" className="space-y-6">/g,
  `{franchise && (
        <section id="franchise-collection-section" className="space-y-6">`
);

// find the closing tag for the franchise-collection-section
code = code.replace(
  /<\/section>\s+\{!-- 2\. MORE LIKE THIS \/ RELATED --\}/g,
  `</section>
        )}
        
        {/* 2. MORE LIKE THIS / RELATED */}`
);

// Just in case it's different comments
code = code.replace(
  /<\/section>\s+\{\/\* 2\. MORE LIKE THIS \/ RELATED \*\/\}/g,
  `</section>
        )}
        
        {/* 2. MORE LIKE THIS / RELATED */}`
);

fs.writeFileSync('src/components/ShowDetailPage.tsx', code, 'utf8');
console.log("Updated ShowDetailPage.tsx");
