import React, { useState, useEffect } from 'react';
import { OrchestratedMedia } from '../services/resolvers/MediaOrchestrator';
import { StreamCandidate } from '../services/resolvers/StreamResolver';
import { PlaybackHealth } from '../services/resolvers/PlaybackProbe';

interface DiagnosticPanelProps {
  orchestratedMedia: OrchestratedMedia | null;
  activeCandidate: StreamCandidate | null;
  playbackHealth: PlaybackHealth;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  orchestratedMedia,
  activeCandidate,
  playbackHealth,
  iframeRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV === 'production' && !localStorage.getItem('x2shows_debug')) {
    return null; // Only show in dev or if forced via localStorage
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-black/80 border border-[#00f2fe]/50 text-[#00f2fe] px-3 py-1.5 rounded-lg text-[10px] font-mono shadow-lg hover:bg-black"
      >
        [+] DEV DIAGNOSTICS
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/95 border-2 border-[#00f2fe] text-[#99f6e4] p-4 rounded-xl text-[10px] font-mono shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 border-b border-[#00f2fe]/30 pb-2">
        <h3 className="text-white font-black text-xs">PLAYBACK DIAGNOSTICS</h3>
        <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300 px-2 py-1 bg-red-900/30 rounded border border-red-500/50">CLOSE</button>
      </div>

      <div className="space-y-4">
        <section>
          <h4 className="text-[#00f2fe] font-bold mb-1">MEDIA IDENTITY</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-gray-500">Show:</span> <span>{orchestratedMedia?.resolution.metadata?.title || 'Unknown'}</span>
            <span className="text-gray-500">TMDB ID:</span> <span>{orchestratedMedia?.resolution.identity.showId || 'N/A'}</span>
            <span className="text-gray-500">Season:</span> <span>{orchestratedMedia?.resolution.identity.seasonNumber || 'N/A'}</span>
            <span className="text-gray-500">Episode:</span> <span>{orchestratedMedia?.resolution.identity.episodeNumber || 'N/A'}</span>
            <span className="text-gray-500">Episode ID:</span> <span>{orchestratedMedia?.resolution.metadata?.id || 'N/A'}</span>
          </div>
        </section>

        <section>
          <h4 className="text-[#00f2fe] font-bold mb-1">SOURCE</h4>
          <div className="grid grid-cols-1 gap-1">
            <div><span className="text-gray-500">Provider:</span> {activeCandidate?.sourceProvider || 'None'}</div>
            <div className="truncate"><span className="text-gray-500">URL:</span> {activeCandidate?.url || 'N/A'}</div>
            <div><span className="text-gray-500">Candidate score:</span> {activeCandidate?.providerHealthScore || 0}</div>
          </div>
        </section>

        <section>
          <h4 className="text-[#00f2fe] font-bold mb-1">EMBED</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-gray-500">HTTP:</span> <span>{activeCandidate?.url.startsWith('https') ? 'HTTPS' : 'HTTP'}</span>
            <span className="text-gray-500">Iframe Ref:</span> <span className={iframeRef.current ? "text-green-400" : "text-red-400"}>{iframeRef.current ? 'ATTACHED' : 'NULL'}</span>
            <span className="text-gray-500">Sandbox:</span> <span>{iframeRef.current?.getAttribute('sandbox') || 'NOT PRESENT'}</span>
          </div>
        </section>

        <section>
          <h4 className="text-[#00f2fe] font-bold mb-1">PLAYBACK</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-gray-500">Health State:</span> 
            <span className={
              playbackHealth === 'playback_confirmed' ? "text-green-400" :
              playbackHealth === 'failed' || playbackHealth === 'blocked' ? "text-red-400" : "text-yellow-400"
            }>{playbackHealth}</span>
          </div>
        </section>

        <section className="pt-2 border-t border-[#00f2fe]/30">
          <h4 className="text-white font-bold mb-1">FINAL</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-gray-500">Identity:</span> <span className={orchestratedMedia?.resolution.success ? "text-green-400" : "text-red-400"}>{orchestratedMedia?.resolution.success ? 'PASS' : 'FAIL'}</span>
            <span className="text-gray-500">Embed:</span> <span className={activeCandidate ? "text-green-400" : "text-red-400"}>{activeCandidate ? 'PASS' : 'FAIL'}</span>
            <span className="text-gray-500">Playback:</span> <span className={playbackHealth === 'playback_confirmed' ? "text-green-400" : "text-yellow-400"}>{playbackHealth === 'playback_confirmed' ? 'PASS' : 'PENDING/FAIL'}</span>
          </div>
        </section>
      </div>
    </div>
  );
};
