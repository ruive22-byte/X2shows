import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  Tv, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Info,
  Layers,
  Flame,
  Check
} from 'lucide-react';
import { AspectRatioMode, SkeletonCardItem } from '../types';
import { ContinueWatchingShow } from '../data/continueWatchingData';
import { TmdbImage } from './TmdbImage';

interface ContinueWatchingRowProps {
  items: ContinueWatchingShow[];
  aspectRatio: AspectRatioMode;
  onResumeShow: (show: ContinueWatchingShow) => void;
  onAdvanceEpisode: (showId: string) => void;
  onRemoveItem: (showId: string) => void;
  onOpenDetails: (card: SkeletonCardItem) => void;
  onClearAll?: () => void;
  onShowToast: (msg: string) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = React.memo(({
  items,
  aspectRatio,
  onResumeShow,
  onAdvanceEpisode,
  onRemoveItem,
  onOpenDetails,
  onClearAll,
  onShowToast
}) => {
  const rowScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = () => {
    if (rowScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      rowScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (!items || items.length === 0) return null;

  const totalEps = items.reduce((acc, item) => acc + (item.currentEpisode || 1), 0);
  const totalMinsRemaining = items.reduce((acc, item) => acc + (item.remainingMinutes || 15), 0);

  return (
    <section 
      id="continue-watching-section" 
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 select-none font-cartoon animate-category-fade"
    >
      {/* Row Header with Modern Black Outlines & Status Badges */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#14b8a6] to-[#0284c7] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
              <Clock className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2 flex-wrap">
              <span className="modern-cartoony-number text-white">Continue Watching</span>
              
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white text-[10px] font-black tracking-wider uppercase border border-black shadow-[1.5px_1.5px_0px_#000000]">
                IN PROGRESS
              </span>
              
              <span className="px-2 py-0.5 rounded-md bg-[#07151e] text-[#00f2fe] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number">
                {items.length} SHOWS
              </span>

              <span className="px-2 py-0.5 rounded-md bg-[#0d2836] text-[#7dd3fc] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] hidden sm:inline-block modern-cartoony-number">
                {totalEps} EPS IN PROGRESS
              </span>

              <span className="px-2 py-0.5 rounded-md bg-[#0d2836] text-[#facc15] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] hidden md:inline-block modern-cartoony-number">
                ~{totalMinsRemaining}m REMAINING
              </span>
            </h2>
          </div>
          
          <p className="text-xs sm:text-sm text-[#99f6e4] pl-11 font-semibold max-w-2xl">
            Pick up right where you left off with real-time episode progress & instant 4K playback
          </p>
        </div>

        {/* Scroll Navigation Arrows */}
        <div className="flex items-center gap-2">
          {onClearAll && items.length > 2 && (
            <button
              onClick={onClearAll}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0d2836] hover:bg-[#ef4444] text-[#99f6e4] hover:text-white border-2 border-black text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
              title="Clear all continue watching items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border-2 border-black transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-[#0d2836] hover:bg-[#14b8a6] text-white shadow-[2px_2px_0px_#000000] hover:scale-110 active:translate-x-[1px] active:translate-y-[1px]'
                  : 'bg-[#07151e]/40 text-neutral-600 opacity-40 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border-2 border-black transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-[#0d2836] hover:bg-[#14b8a6] text-white shadow-[2px_2px_0px_#000000] hover:scale-110 active:translate-x-[1px] active:translate-y-[1px]'
                  : 'bg-[#07151e]/40 text-neutral-600 opacity-40 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Cards Container */}
      <div className="relative group">
        
        {/* Left Edge Fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-r from-[#07151e] to-transparent" />
        )}

        <div
          ref={rowScrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {items.map((item, index) => {
            const isFullLengthMovie = item.totalEpisodes === 1;

            return (
              <div
                key={`cw-row-${item.id || item.showId || index}-${index}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`shrink-0 transition-transform animate-card-stagger ${
                  aspectRatio === '16:9'
                    ? 'w-72 sm:w-80 md:w-92'
                    : 'w-56 sm:w-64 md:w-72'
                }`}
              >
                <div 
                  className="group/card relative rounded-3xl overflow-hidden bg-[#07151e] border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail Banner with Clean Overlay */}
                  <div 
                    onClick={() => onResumeShow(item)}
                    className={`relative w-full overflow-hidden bg-[#0d2836] border-b-2 border-black cursor-pointer ${
                      aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[16/10]'
                    }`}
                  >
                    <TmdbImage
                      showId={item.showId || item.id}
                      id={item.showId || item.id}
                      posterPath={item.posterUrl}
                      backdropPath={item.backdropUrl}
                      type={aspectRatio === '16:9' ? 'backdrop' : 'poster'}
                      title={item.title}
                      genres={item.genres}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-[#07151e]/30 to-transparent" />

                    {/* Top Left: Season & Episode Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#07151e]/95 text-[#00f2fe] font-black text-[10px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
                        {isFullLengthMovie ? 'MOVIE' : `S${item.season}:E${item.currentEpisode}`}
                      </span>
                    </div>

                    {/* Top Right: Remaining Time Badge */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#14b8a6] text-black font-black text-[10px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number flex items-center gap-1">
                        <Clock className="w-3 h-3 text-black stroke-[2.5]" />
                        <span>{item.remainingMinutes}m left</span>
                      </span>
                    </div>

                    {/* Center Hover Play Glow */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#38bdf8] text-white flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000000] transform group-hover/card:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar at bottom of thumbnail */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] transition-all duration-300 relative"
                        style={{ width: `${item.progressPercent}%` }}
                      >
                        <div className="absolute -top-0.5 right-0 w-2.5 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Content & Action Controls */}
                  <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#07151e]">
                    
                    {/* Titles and Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-[#38bdf8] uppercase tracking-wider truncate">{item.studio}</span>
                        <span className="text-[#00f2fe] modern-cartoony-number">{item.progressPercent}% Watched</span>
                      </div>

                      <h3 
                        onClick={() => onResumeShow(item)}
                        className="text-sm sm:text-base font-black text-white line-clamp-1 group-hover/card:text-[#00f2fe] transition-colors cursor-pointer"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {item.episodeTitle && (
                        <p className="text-[11px] text-[#99f6e4] line-clamp-1 font-semibold">
                          Ep {item.currentEpisode}: {item.episodeTitle}
                        </p>
                      )}
                    </div>

                    {/* Interactive Action Bar */}
                    <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-2">
                      
                      {/* Resume / Play Button */}
                      <button
                        onClick={() => onResumeShow(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0284c7] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white hover:text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000000] transition-all transform active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                        title={`Resume ${item.title}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>

                      {/* +1 Episode Step Button (if series) */}
                      {!isFullLengthMovie && item.currentEpisode < item.totalEpisodes && (
                        <button
                          onClick={() => onAdvanceEpisode(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#7dd3fc] border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000000] transition-all transform active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-0.5"
                          title="Advance to next episode (+1 Ep)"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Ep</span>
                        </button>
                      )}

                      {/* Info / Drawer Button */}
                      <button
                        onClick={() => {
                          onOpenDetails({
                            id: item.showId || item.id,
                            category: 'For You',
                            navType: 'Anime',
                            matchScore: item.matchScore,
                            durationMinutes: item.durationMinutes,
                            qualityBadges: [item.qualityBadge],
                            genreTags: item.genres,
                            isFeatured: true
                          });
                        }}
                        className="p-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#99f6e4] border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                        title="Show Details"
                      >
                        <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-xl bg-[#0d2836] hover:bg-[#ef4444] text-[#99f6e4] hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                        title="Remove from Continue Watching"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Edge Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-l from-[#07151e] to-transparent" />
        )}

      </div>
    </section>
  );
});

ContinueWatchingRow.displayName = 'ContinueWatchingRow';
