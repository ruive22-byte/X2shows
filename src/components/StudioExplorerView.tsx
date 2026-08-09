import React, { useState } from 'react';
import { 
  Building2, Globe, Sparkles, Award, Star, 
  Play, Film, ArrowRight, Layers, Trophy
} from 'lucide-react';
import { Show } from '../types';

interface StudioExplorerViewProps {
  shows: Show[];
  onPlayShow: (show: Show) => void;
  onOpenDetails: (show: Show) => void;
}

export const StudioExplorerView: React.FC<StudioExplorerViewProps> = ({
  shows,
  onPlayShow,
  onOpenDetails,
}) => {
  const [selectedStudio, setSelectedStudio] = useState('Fortiche Production');

  const studiosData = [
    {
      name: 'Fortiche Production',
      headquarters: 'Paris, France',
      foundedYear: '2009',
      style: 'Hand-Painted 2D Textures over 3D Rigging & Stepped Framerates',
      description: 'Pioneered the revolutionary aesthetic that blends French graphic novel tradition with high-speed cinematic choreography in Arcane.',
      signatureWorks: ['Arcane: League of Legends', 'Pop/Stars (K/DA)', 'Get Jinxed'],
      awards: ['4x Primetime Emmy Awards', '9x Annie Awards'],
      bannerBg: 'from-rose-950 to-purple-950',
    },
    {
      name: 'Studio Trigger',
      headquarters: 'Suginami, Tokyo, Japan',
      foundedYear: '2011',
      style: 'Dynamic Cel-Glow, Hyper-Kinetic Perspective Shifts & Geometric FX',
      description: 'Founded by former Gainax alumni Hiroyuki Imaishi and Masahiko Otsuka, famous for uncompromising frame rate intensity and bold color palettes.',
      signatureWorks: ['Cyberpunk: Edgerunners', 'Kill la Kill', 'Promare'],
      awards: ['Anime of the Year (Crunchyroll)', 'Tokyo Anime Award Festival'],
      bannerBg: 'from-blue-950 to-cyan-950',
    },
    {
      name: 'Ufotable',
      headquarters: 'Suginami, Tokyo, Japan',
      foundedYear: '2000',
      style: 'Digital VFX Camera-Mapping, Dynamic Lighting & Photorealistic Compositing',
      description: 'Renowned for creating the most technologically complex sword choreography in anime history via custom 3D background camera sweeps.',
      signatureWorks: ['Demon Slayer: Infinity Castle', 'Fate/stay night: Heaven\'s Feel', 'Tales of Zestiria'],
      awards: ['Japan Academy Film Prize', 'Newtype Anime Awards #1'],
      bannerBg: 'from-amber-950 to-rose-950',
    },
    {
      name: 'Sony Pictures Animation',
      headquarters: 'Culver City, California, USA',
      foundedYear: '2002',
      style: 'Variable Frame Rates (On-The-Twos), Half-Tone Comic Printing & Visual Multiverses',
      description: 'Broke every conventional rule of modern computer animation by inventing a multi-aesthetic pipeline that mirrors print ink and comic halftones.',
      signatureWorks: ['Spider-Man: Across the Spider-Verse', 'The Mitchells vs. the Machines'],
      awards: ['Academy Award for Best Animated Feature', '7x Annie Awards'],
      bannerBg: 'from-purple-950 to-blue-950',
    },
    {
      name: 'Madhouse',
      headquarters: 'Honcho, Nakano, Tokyo, Japan',
      foundedYear: '1972',
      style: 'Lyrical Watercolor Fantasy, Expressive Weight & Kinetic Momentum',
      description: 'Over 50 years of legendary animation heritage, mastering the delicate art of emotional pacing, atmospheric worldbuilding, and tactical battles.',
      signatureWorks: ["Frieren: Beyond Journey's End", 'Hunter x Hunter', 'One Punch Man (S1)', 'Death Note'],
      awards: ['Grand Prize Tokyo Anime Award', 'Kobe Animation Award'],
      bannerBg: 'from-emerald-950 to-blue-950',
    },
  ];

  const currentStudioInfo = studiosData.find(s => s.name === selectedStudio) || studiosData[0];
  const studioShows = shows.filter(s => s.studio.toLowerCase().includes(currentStudioInfo.name.toLowerCase()) || currentStudioInfo.name.toLowerCase().includes(s.studio.toLowerCase()));

  return (
    <div id="studio-explorer-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-rose-300">
            Architects of Movement
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Studios & Visual Philosophies
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Discover the world-class animation powerhouses behind XTwo Shows. Explore their proprietary rendering engines, signature animator styles, and award histories.
        </p>
      </div>

      {/* Studio Selector Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {studiosData.map((st) => (
          <button
            key={st.name}
            onClick={() => setSelectedStudio(st.name)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedStudio === st.name
                ? 'bg-gradient-to-r from-[#800020] to-[#2563EB] text-white shadow-xl shadow-rose-950/60 border border-rose-400/40'
                : 'bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{st.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Studio Feature Panel */}
      <div className={`rounded-3xl p-6 sm:p-10 bg-gradient-to-br ${currentStudioInfo.bannerBg} border border-white/10 shadow-2xl space-y-6`}>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-300">
              <Globe className="w-4 h-4" />
              <span>{currentStudioInfo.headquarters} • Founded {currentStudioInfo.foundedYear}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-1">
              {currentStudioInfo.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentStudioInfo.awards.map((award, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {award}
              </span>
            ))}
          </div>
        </div>

        {/* Style and Philosophy Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-mono-code text-rose-300 font-bold uppercase tracking-wider">
              Signature Rendering & Animation Style
            </h3>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {currentStudioInfo.style}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStudioInfo.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono-code text-blue-300 font-bold uppercase tracking-wider">
              Legendary Production Pipeline
            </h3>
            <div className="space-y-2">
              {currentStudioInfo.signatureWorks.map((work, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-white">{work}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shows from this studio available in XTwo */}
        {studioShows.length > 0 && (
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-400" />
              <span>Available in 4K HDR on XTwo Shows</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studioShows.map((show, idx) => (
                <div 
                  key={`studio-show-${show.id || idx}-${idx}`}
                  className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-3 hover:border-rose-500 transition-all"
                >
                  <img 
                    src={show.heroPosterUrl} 
                    alt={show.title} 
                    className="w-16 h-20 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">{show.title}</h4>
                    <div className="text-[10px] text-amber-300">★ {show.score} Masterpiece</div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onPlayShow(show)}
                        className="px-2.5 py-1 rounded bg-rose-900 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch</span>
                      </button>
                      <button
                        onClick={() => onOpenDetails(show)}
                        className="px-2 py-1 rounded bg-white/10 text-white text-[10px]"
                      >
                        Cast
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
