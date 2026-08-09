import React, { useState } from 'react';
import { Play, Info, Bookmark, Check, Star, Sparkles, Layers } from 'lucide-react';
import { Show } from '../types';
import { CardPoster } from './CardPoster';

interface ShowCardProps {
  show: Show & {
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
  };
  onPlay: (show: Show) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: boolean;
  onStartWatchParty?: (show: Show) => void;
  compact?: boolean;
}

/**
 * Memoized ShowCard Component
 * Prevents unnecessary parent re-renders and hover lag
 */
export const ShowCard: React.FC<ShowCardProps> = React.memo(({
  show,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dynamically check title (for movies) OR name (for TV shows)
  const displayTitle = show.title || show.name || 'Animated Show';
  const posterPath = show.poster_path !== undefined ? show.poster_path : (show.heroPosterUrl || null);
  const matchPercent = show.matchPercentage || (show.vote_average ? Math.round(show.vote_average * 10) : 98);

  return (
    <div
      id={`show-card-${show.id}`}
      className={`group relative rounded-2xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:border-[#00f2fe] transition-all flex flex-col font-cartoon cursor-pointer ${
        compact ? 'w-48 sm:w-56 shrink-0' : 'w-full'
      }`}
      onClick={() => onOpenDetails(show)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image Container with strict TMDB mapping and Cyan Fallback */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#07151e]">
        <CardPoster 
          item={show} 
          alt={displayTitle} 
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out" 
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-[#07151e]/30 to-transparent z-5" />

        {/* Top Badges: Score & Resolution */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-[#14b8a6] text-black border border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
            <Star className="w-3 h-3 fill-black text-black" />
            {show.score || show.vote_average || 9.5}
          </span>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00f2fe] text-black border border-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000]">
            4K TOON
          </span>
        </div>

        {/* Hover Quick Actions Overlay Inside Card with Tags & Details Button */}
        {isHovered && (
          <div className="absolute inset-0 bg-[#07151e]/95 flex flex-col justify-between p-3.5 animate-in fade-in duration-150 z-20 border-2 border-[#00f2fe]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#7dd3fc] font-black bg-[#0d2836] px-2 py-0.5 rounded-md border border-black">
                {show.studio || 'Sakuga Studio'}
              </span>
              <span className="text-[10px] text-[#f0fdfa] font-bold">
                {show.seasonCount || 1}S • {show.episodesCount || 12}E
              </span>
            </div>

            {/* Center: Title & Fitted Genre Tags */}
            <div className="text-center space-y-1.5 my-auto">
              <h4 className="font-black text-xs sm:text-sm text-[#00f2fe] line-clamp-1">
                {displayTitle}
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {(show.genres || ['Animation', 'Action']).slice(0, 3).map((g, idx) => (
                  <span key={idx} className="px-1.5 py-0.2 rounded bg-[#0d2836] text-[9px] font-black text-[#ccfbf1] border border-black">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: Details Button, Quick Play & Watchlist */}
            <div className="flex items-center justify-between pt-1 border-t border-black/40">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(show);
                }}
                className="flex items-center gap-1 text-[11px] font-black text-[#7dd3fc] hover:text-white px-2 py-1 rounded-lg bg-[#0d2836] border border-black hover:bg-[#14b8a6] hover:text-black transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span>Details</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  id={`card-play-${show.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(show);
                  }}
                  className="p-1.5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#38bdf8] text-white hover:text-black border border-black shadow-[1.5px_1.5px_0px_#000000] hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  title="Play in 4K Theater"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(show.id);
                  }}
                  className={`p-1.5 rounded-xl border border-black transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000] ${
                    isInWatchlist
                      ? 'bg-[#14b8a6] text-black'
                      : 'bg-[#0d2836] text-white hover:bg-[#14b8a6] hover:text-black'
                  }`}
                  title={isInWatchlist ? "Saved in Watchlist" : "Save to Watchlist"}
                >
                  {isInWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Info Below Poster */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-[#07151e] border-t-2 border-black">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#00f2fe] transition-colors truncate">
              {displayTitle}
            </h3>
          </div>
          
          <p className="text-xs text-[#ccfbf1] line-clamp-2 leading-relaxed font-medium">
            {show.tagline || show.synopsis || show.overview}
          </p>
        </div>

        {/* Footer with Animation Style & Match percentage */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-black/40 text-[11px]">
          <span className="flex items-center gap-1 text-[#99f6e4] font-bold truncate max-w-[130px]">
            <Layers className="w-3 h-3 text-[#38bdf8] shrink-0" />
            <span className="truncate">{show.animationStyle || show.genres?.[0] || 'Sakuga'}</span>
          </span>

          <span className="text-[#00f2fe] font-black modern-cartoony-number shrink-0">
            {matchPercent}% Match
          </span>
        </div>
      </div>
    </div>
  );
});
