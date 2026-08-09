import React, { useState } from 'react';
import { 
  Sparkles, Play, Flame, Layers, Star, Zap, 
  Search, Eye, Shield, Award, SlidersHorizontal
} from 'lucide-react';
import { Show, SakugaClip } from '../types';

interface SakugaVaultViewProps {
  shows: Show[];
  onPlayShow: (show: Show, episodeNumber?: number) => void;
  onOpenDetails: (show: Show) => void;
}

export const SakugaVaultView: React.FC<SakugaVaultViewProps> = ({
  shows,
  onPlayShow,
  onOpenDetails,
}) => {
  const [selectedAnimator, setSelectedAnimator] = useState('all');
  const [playbackSpeed, setPlaybackSpeed] = useState<0.25 | 0.5 | 1>(1);

  // Flatten all sakuga clips
  const allClips: Array<SakugaClip & { show: Show }> = shows.flatMap(show => 
    show.sakugaClips.map(clip => ({ ...clip, show }))
  );

  const animators = [
    { id: 'all', name: 'All Master Animators' },
    { id: 'Yutaka Nakamura', name: 'Yutaka Nakamura ("Yutapon Cubes")' },
    { id: 'Arifumi Imai', name: 'Arifumi Imai (3D Camera Choreography)' },
    { id: 'Chengxi Huang', name: 'Chengxi Huang (Fluid Taijutsu & Weight)' },
    { id: 'Vincent Chansard', name: 'Vincent Chansard (Lightning & Debris)' },
    { id: 'Fortiche Keyframe Unit', name: 'Fortiche Keyframe Unit (Painted 3D)' },
  ];

  const filteredClips = selectedAnimator === 'all'
    ? allClips
    : allClips.filter(c => c.animator?.toLowerCase()?.includes(selectedAnimator.toLowerCase()));

  return (
    <div id="sakuga-vault-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-[#100D1A] to-blue-950 p-6 sm:p-10 border border-rose-900/40 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono-code font-bold bg-rose-900/80 text-rose-300 border border-rose-600/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Frame-by-Frame Archival
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono-code bg-blue-950 text-blue-300 border border-blue-500/40">
              120 FPS High Dynamic Cuts
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            The Sakuga & Keyframe Vault
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Deconstruct the greatest animated cuts in human history. Study fluid smear frames, hyper-dynamic 3D camera tracking, and the distinct drawing signatures of world-renowned master animators.
          </p>

          {/* Slow Motion Scrub Toggle */}
          <div className="flex items-center gap-2 pt-2 text-xs font-mono-code">
            <span className="text-slate-400 font-bold">Analysis Speed:</span>
            {[
              { val: 0.25, label: '0.25x Frame Study' },
              { val: 0.5, label: '0.5x Slow Motion' },
              { val: 1, label: '1.0x Real-time' },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setPlaybackSpeed(s.val as any)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  playbackSpeed === s.val
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animator Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {animators.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAnimator(a.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedAnimator === a.id
                ? 'bg-gradient-to-r from-rose-900 to-blue-800 text-white shadow-lg border border-rose-400/40'
                : 'bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Grid of Sakuga Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClips.map((clip) => (
          <div
            key={clip.id}
            className="group rounded-2xl overflow-hidden bg-[#13111B] border border-white/[0.08] hover:border-rose-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="relative aspect-video overflow-hidden bg-black/60">
              <img 
                src={clip.show.heroPosterUrl} 
                alt={clip.sceneName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#13111B] via-transparent to-black/50" />

              {/* Center Trigger to play clip */}
              <button
                onClick={() => onPlayShow(clip.show, 1)}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-rose-900 to-blue-600 text-white flex items-center justify-center shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
                title={`Study ${clip.sceneName} at ${playbackSpeed}x`}
              >
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </button>

              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono-code text-cyan-300 border border-cyan-500/30">
                {clip.frameRate}
              </span>

              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-rose-950/80 text-[10px] font-mono-code text-rose-300 border border-rose-800/40">
                {clip.show.studio}
              </span>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-mono-code text-rose-400 font-bold uppercase tracking-wider">
                  {clip.show.title}
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  {clip.sceneName}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {clip.notes}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono-code text-slate-500 uppercase font-bold">Key Animator</div>
                  <div className="text-xs font-bold text-blue-300">{clip.animator}</div>
                </div>

                <button
                  onClick={() => onOpenDetails(clip.show)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  Show Lore
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
