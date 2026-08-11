const fs = require('fs');

let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');

const properOverlay = `
  const isResolving = isLoadingEpisodes || !orchestratedMedia || playbackHealth === 'resolving' || playbackHealth === 'idle';
  if (isResolving && !iframeRef.current) {
     return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040a0f] text-[#f0fdfa] font-cartoon">
            <Loader2 className="w-12 h-12 animate-spin text-[#00f2fe] mb-4" />
            <h2 className="text-2xl font-black mb-2 animate-pulse">Initializing Stream Engine...</h2>
            <p className="text-sm text-[#99f6e4]">Capturing exact media identity and verifying stream integrity.</p>
        </div>
     );
  }

`;

code = code.replace("  return (\n    <div className=\"min-h-screen", properOverlay + "  return (\n    <div className=\"min-h-screen");

fs.writeFileSync('src/components/WatchPage.tsx', code);
