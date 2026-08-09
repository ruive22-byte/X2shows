import React, { useState } from 'react';
import { SkeletonCardItem } from '../types';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  ThumbsUp, 
  Share2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Film, 
  Layers, 
  Tv, 
  Zap,
  Smile,
  Heart
} from 'lucide-react';
import { TmdbImage } from './TmdbImage';

interface SkeletonDrawerModalProps {
  card: (SkeletonCardItem & {
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average?: number;
    studio?: string;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const SkeletonDrawerModal: React.FC<SkeletonDrawerModalProps> = ({
  card,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'specs' | 'similar'>('episodes');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isInList, setIsInList] = useState<boolean>(false);

  if (!isOpen || !card) return null;

  const displayTitle = card.title || card.name || `Animation #${card.id}`;
  const posterPath = card.posterUrl || card.poster_path || null;
  const backdropPath = card.backdropUrl || card.backdrop_path || null;
  const overview = card.overview || 'An extraordinary animated spectacle featuring breathtaking sakuga, vivid characters, and immersive storytelling mapped strictly from TMDB.';
  const matchScore = card.matchScore || (card.vote_average ? Math.round(card.vote_average * 10) : 98);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 font-cartoon">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[8px_8px_0px_#000000] space-y-6 text-white no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-white transition-all transform hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shadow-[3px_3px_0px_#000000]"
          aria-label="Close cartoon modal"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 16:9 Video Frame Skeleton Banner in Teal & Light Blue with Real TMDB Backdrop */}
        <div className="relative w-full aspect-[16/9] rounded-t-3xl overflow-hidden bg-[#0a2330] border-b-[3px] border-black">
          <TmdbImage
            backdropPath={backdropPath}
            posterPath={posterPath}
            type="backdrop"
            title={displayTitle}
            name={card.name}
            genres={card.genreTags}
            qualityBadge={card.qualityBadges?.[0] || '4K UHD'}
            className="w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-transparent to-black/40 z-10" />

          {/* Top Indicators */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white text-xs font-black tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000]">
              4K TOON PREVIEW
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#07151e] text-xs font-black text-[#7dd3fc] border-2 border-black shadow-[2px_2px_0px_#000000]">
              120 FPS SAKUGA • AV1
            </span>
          </div>

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                onShowToast(isPlaying ? 'Stream buffer paused' : `Streaming 4K "${displayTitle}" in 120 FPS...`);
              }}
              className="p-5 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white hover:text-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-all transform hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer border-[3px] border-black"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          </div>

          {/* Bottom Video Meta Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-[2px_2px_0px_#000000]">
                {displayTitle}
              </h3>
              <p className="text-xs text-[#99f6e4] font-bold">
                {card.studio || 'Official Animation Studio'} • {card.durationMinutes || 24}m Episode Master
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsInList(!isInList);
                  onShowToast(!isInList ? `Added "${displayTitle}" to My List` : `Removed "${displayTitle}" from My List`);
                }}
                className={`px-4 py-2 rounded-2xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2.5px_2.5px_0px_#000000] ${
                  isInList ? 'bg-[#14b8a6] text-black' : 'bg-[#0d2836] text-white'
                }`}
              >
                {isInList ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                <span>{isInList ? 'In Watchlist' : 'Add to List'}</span>
              </button>

              <button
                onClick={() => onShowToast(`Shared "${displayTitle}" stream link`)}
                className="p-2 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-white shadow-[2.5px_2.5px_0px_#000000]"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Info & Metadata Tabs */}
        <div className="px-6 pb-6 space-y-6">
          
          {/* Metadata Row: 98% MATCH, Quality Badges, Genre Chips */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b-2 border-black/30">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#38bdf8] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] modern-cartoony-number">
                {matchScore}% MATCH
              </span>
              
              <span className="px-2.5 py-1 rounded-xl bg-[#0d2836] border-2 border-black text-xs font-black text-[#7dd3fc]">
                {card.navType || 'TV'} ANIMATION
              </span>

              <span className="px-2.5 py-1 rounded-xl bg-[#0d2836] border-2 border-black text-xs font-black text-[#2dd4bf]">
                DOLBY VISION
              </span>
            </div>

            <div className="flex items-center gap-2">
              {card.genreTags?.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-full bg-[#14b8a6]/20 border border-[#14b8a6] text-[#99f6e4] text-xs font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Real TMDB Overview Narrative */}
          <div className="space-y-2">
            <h4 className="text-sm font-black text-[#38bdf8] uppercase tracking-wider">
              Storyline & Animation Highlights
            </h4>
            <p className="text-sm text-[#e0f2fe] leading-relaxed font-medium">
              {overview}
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b-2 border-black/40 pb-2">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`px-4 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] ${
                activeTab === 'episodes'
                  ? 'bg-[#00f2fe] text-black'
                  : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
              }`}
            >
              Episodes & Sakuga
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] ${
                activeTab === 'specs'
                  ? 'bg-[#00f2fe] text-black'
                  : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
              }`}
            >
              Technical Specs
            </button>
          </div>

          {/* Tab Content: Episodes & Highlights */}
          {activeTab === 'episodes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[1, 2, 3, 4].map((ep) => (
                <div 
                  key={ep}
                  className="p-3.5 rounded-2xl bg-[#0d2836] border-2 border-black hover:border-[#00f2fe] shadow-[3px_3px_0px_#000000] transition-all flex items-center justify-between group cursor-pointer"
                  onClick={() => onShowToast(`Loaded Episode ${ep} of "${displayTitle}" in 4K...`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#14b8a6] text-black font-black flex items-center justify-center border border-black shadow-[1.5px_1.5px_0px_#000000]">
                      {ep}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white group-hover:text-[#00f2fe]">
                        Episode {ep}: Chapter Sequence
                      </h5>
                      <p className="text-[11px] text-[#99f6e4] font-bold">
                        24 min • 120 FPS Fluid Sakuga
                      </p>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-[#38bdf8] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Technical Specs */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[3px_3px_0px_#000000]">
              <div className="space-y-1">
                <span className="text-[10px] text-[#7dd3fc] font-black uppercase">Resolution</span>
                <p className="text-xs font-black text-white">4K UHD (3840x2160)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#7dd3fc] font-black uppercase">Framerate</span>
                <p className="text-xs font-black text-white">120 FPS Native Frame Pacing</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#7dd3fc] font-black uppercase">Audio Stream</span>
                <p className="text-xs font-black text-white">Dolby Atmos 7.1.4 Surround</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#7dd3fc] font-black uppercase">Color Space</span>
                <p className="text-xs font-black text-white">BT.2020 12-Bit Teal HDR</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
