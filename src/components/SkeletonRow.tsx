import React, { useState, useRef } from 'react';
import { SkeletonSection, SkeletonCardItem, AspectRatioMode } from '../types';
import { SkeletonCard } from './SkeletonCard';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  Rocket, 
  Layers,
  LayoutGrid,
  Grid,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

interface SkeletonRowProps {
  section: SkeletonSection;
  aspectRatio: AspectRatioMode;
  isHomePage?: boolean;
  layoutMode?: 'horizontal' | 'vertical';
  onOpenDetails: (card: SkeletonCardItem) => void;
  onPlay?: (card: SkeletonCardItem) => void;
  onShowToast: (msg: string) => void;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = React.memo(({
  section,
  aspectRatio,
  isHomePage = true,
  layoutMode,
  onOpenDetails,
  onPlay,
  onShowToast
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const rowScrollRef = useRef<HTMLDivElement>(null);

  // Derive active layout: Home page is horizontal, all other categories are vertical
  const isHorizontal = layoutMode ? layoutMode === 'horizontal' : isHomePage;

  const getSectionTitleIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('for you')) {
      return <Sparkles className="w-4 h-4 text-[#38bdf8] animate-[spin_3s_linear_infinite]" />;
    }
    if (t.includes('top 10')) {
      return <Flame className="w-4 h-4 text-[#14b8a6] animate-bounce" />;
    }
    if (t.includes('cause you like')) {
      return <Heart className="w-4 h-4 text-[#ef4444] fill-[#ef4444] animate-pulse" />;
    }
    if (t.includes('explore more')) {
      return <Rocket className="w-4 h-4 text-[#2dd4bf] animate-[bounce_2s_infinite]" />;
    }
    if (t.includes('newly added')) {
      return <Sparkles className="w-4 h-4 text-[#00f2fe] animate-ping" />;
    }
    return <LayoutGrid className="w-4 h-4 text-[#7dd3fc] animate-pulse" />;
  };

  const handleScrollLeft = () => {
    if (rowScrollRef.current) {
      rowScrollRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (rowScrollRef.current) {
      rowScrollRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  const totalDuration = section.cards.reduce((acc, c) => acc + (c.durationMinutes || 24), 0);
  const avgMatch = Math.round(
    section.cards.reduce((acc, c) => acc + (c.matchScore || 95), 0) / (section.cards.length || 1)
  );

  // Specific card width sizing in horizontal layout mode based on selected aspect ratio
  const getHorizontalCardWidth = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'w-[260px] sm:w-[300px] md:w-[340px] shrink-0';
      case '2:3':
      default:
        return 'w-[160px] sm:w-[190px] md:w-[215px] shrink-0';
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 select-none font-cartoon animate-category-fade group/row">
      
      {/* Section Header & Controls */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#14b8a6] to-[#0284c7] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
              {getSectionTitleIcon(section.title)}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2 flex-wrap">
              <span className="modern-cartoony-number flex items-center gap-2">
                 {section.title}
                 {section.hasExploreArrow && (
                   <button 
                     onClick={() => section.onExploreClick?.()}
                     className="p-1 hover:bg-[#14b8a6] hover:text-black rounded-full transition-colors group cursor-pointer"
                     title="View all newly added shows"
                   >
                     <ChevronRight className="w-5 h-5 stroke-[3] group-hover:translate-x-1 transition-transform" />
                   </button>
                 )}
              </span>
              {section.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white text-[10px] font-black tracking-wider uppercase border border-black shadow-[1.5px_1.5px_0px_#000000]">
                  {section.badge}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-black text-[#00f2fe] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number">
                {section.cards.length} TOONS
              </span>
              
              {/* Layout mode indicator */}
              <span className="px-2 py-0.5 rounded-md bg-[#0d2836] text-[#7dd3fc] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] hidden sm:inline-block">
                {isHorizontal ? '⚡ HORIZONTAL ROW' : '📐 VERTICAL GRID'}
              </span>

              <span className="px-2 py-0.5 rounded-md bg-[#0d2836] text-[#facc15] text-[10px] font-black border border-black shadow-[1px_1px_0px_#000000] hidden md:inline-block modern-cartoony-number">
                ★ {avgMatch}% MATCH
              </span>
            </h2>
          </div>
          
          {section.subtitle && (
            <p className="text-xs sm:text-sm text-[#99f6e4] pl-11 font-semibold max-w-2xl">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* View & Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Horizontal Scroll Arrows (Visible in Horizontal Home Mode) */}
          {isHorizontal && (
            <div className="flex items-center gap-1.5 bg-[#07151e] p-1 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000]">
              <button
                onClick={handleScrollLeft}
                className="p-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-white border border-black transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                title="Scroll Row Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleScrollRight}
                className="p-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-white border border-black transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                title="Scroll Row Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collapse Toggle for Vertical Grid Mode */}
          {!isHorizontal && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-xs font-black text-[#ccfbf1] transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
              title={isExpanded ? 'Collapse section' : 'Expand vertical grid'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Show All ({section.cards.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 1. HORIZONTAL CAROUSEL LAYOUT: Strictly for Home Page */}
      {isHorizontal && (
        <div className="relative w-full">
          {/* Left Arrow Floating Hover Control */}
          <button
            onClick={handleScrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#07151e]/95 hover:bg-[#14b8a6] hover:text-black border-2 border-black text-[#00f2fe] shadow-[4px_4px_0px_#000000] opacity-0 group-hover/row:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center cursor-pointer hover:scale-110"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Right Arrow Floating Hover Control */}
          <button
            onClick={handleScrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#07151e]/95 hover:bg-[#14b8a6] hover:text-black border-2 border-black text-[#00f2fe] shadow-[4px_4px_0px_#000000] opacity-0 group-hover/row:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center cursor-pointer hover:scale-110"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Smooth Horizontal Carousel Scroll Track */}
          <div
            ref={rowScrollRef}
            className="flex items-stretch gap-3 sm:gap-4.5 overflow-x-auto scroll-smooth pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#14b8a6] scrollbar-track-[#07151e] snap-x snap-mandatory"
          >
            {section.cards.map((card, index) => {
              const rank = section.isTopTen ? card.trendingRank || index + 1 : undefined;
              return (
                <div
                  key={`carousel-${section.id}-${card.id}-${index}`}
                  style={{ animationDelay: `${(index % 10) * 0.04}s` }}
                  className={`${getHorizontalCardWidth()} snap-start transition-transform hover:-translate-y-1`}
                >
                  <SkeletonCard
                    card={card}
                    aspectRatio={aspectRatio}
                    rank={rank}
                    onOpenDetails={onOpenDetails}
                    onPlay={onPlay}
                    onShowToast={onShowToast}
                  />
                </div>
              );
            })}
            {section.hasExploreArrow && section.onExploreClick && (
              <div 
                className={`${getHorizontalCardWidth()} snap-start transition-transform hover:-translate-y-1 flex items-center justify-center shrink-0`}
              >
                <div 
                  onClick={() => section.onExploreClick?.()}
                  className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 bg-[#07151e] border-2 border-[#14b8a6] rounded-xl cursor-pointer hover:bg-[#14b8a6]/10 transition-colors shadow-[4px_4px_0px_#000000] group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#14b8a6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-8 h-8 stroke-[3] text-black" />
                  </div>
                  <span className="font-black text-[#00f2fe] tracking-wider text-sm sm:text-base group-hover:text-white transition-colors">
                    VIEW ALL
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VERTICAL RESPONSIVE GRID LAYOUT: Strictly for Other Categories (Movies, Anime, Originals, Trending, etc.) */}
      {!isHorizontal && isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5 pt-1">
          {section.cards.map((card, index) => {
            const rank = section.isTopTen ? card.trendingRank || index + 1 : undefined;
            return (
              <div
                key={`grid-${section.id}-${card.id}-${index}`}
                style={{ animationDelay: `${(index % 12) * 0.03}s` }}
                className="w-full transition-transform animate-card-stagger"
              >
                <SkeletonCard
                  card={card}
                  aspectRatio={aspectRatio}
                  rank={rank}
                  onOpenDetails={onOpenDetails}
                  onPlay={onPlay}
                  onShowToast={onShowToast}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

SkeletonRow.displayName = 'SkeletonRow';

