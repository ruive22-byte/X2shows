const fs = require('fs');
let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');

// Replace the backdrop with the iframe
const replacement = `
                    {/* Embedded Iframe as HTML5 Player Fallback */}
                    {activeStreamUrl && playbackHealth !== 'blocked' && (
                      <iframe
                        ref={iframeRef}
                        src={streamUrlWithResume}
                        className="absolute inset-0 w-full h-full border-none z-10"
                        referrerPolicy="origin"
                        allowFullScreen
                        allow="autoplay *; encrypted-media *; picture-in-picture; accelerometer; gyroscope; display-capture"
                        title={\`Streaming \${displayTitle}\`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-20" />
`;

code = code.replace(
  /<TmdbImage[\s\S]*?className=\{`w-full h-full object-cover[\s\S]*?`\}[\s\S]*?\/>/,
  replacement
);

fs.writeFileSync('src/components/WatchPage.tsx', code);
