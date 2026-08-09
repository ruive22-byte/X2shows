import React, { useState, useRef, useEffect } from 'react';
import { SkeletonCardItem, AspectRatioMode } from '../types';
import { 
  Play, 
  Plus, 
  Check, 
  Heart,
  Info,
  Layers,
  Clock,
  Sparkles,
  Star,
  Eye,
  Tv
} from 'lucide-react';
import { TmdbImage } from './TmdbImage';

interface SkeletonCardProps {
  card: SkeletonCardItem & {
    title?: string;
    name?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average?: number;
    studio?: string;
  };
  aspectRatio: AspectRatioMode;
  rank?: number;
  onOpenDetails: (card: SkeletonCardItem) => void;
  onPlay?: (card: SkeletonCardItem) => void;
  onShowToast: (msg: string) => void;
}

/**
 * High-Performance SkeletonCard Component
 * - Preserves crystal-clear poster image with ZERO opaque black/blue screen
 * - Mini Preview Box (mini 2nd page preview) appears smoothly on hover
 * - Zero layout shift / row jumping on hover
 * - Direct "Details" button opens the dedicated show detail page
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = React.memo(({
  card,
  aspectRatio,
  rank,
  onOpenDetails,
  onPlay,
  onShowToast
}) => {
  const [isInList, setIsInList] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showMiniPreview, setShowMiniPreview] = useState<boolean>(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const displayTitle = card.title || card.name || `Animation #${card.id}`;
  const posterPath = card.posterUrl || card.poster_path || null;
  const backdropPath = card.backdropUrl || card.backdrop_path || null;
  const matchScore = card.matchScore || (card.vote_average ? Math.round(card.vote_average * 10) : 98);
  const duration = card.durationMinutes || 24;

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Smooth micro-delay before revealing the mini-preview box (prevents accidental flicker during fast scrolling)
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowMiniPreview(true);
    }, 280);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMiniPreview(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInList(!isInList);
    onShowToast(!isInList ? `Added "${displayTitle}" to My Watchlist` : `Removed "${displayTitle}" from My Watchlist`);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onShowToast(!isLiked ? `Liked "${displayTitle}"!` : `Unliked`);
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(card);
    } else {
      onShowToast(`Streaming 4K "${displayTitle}" in 120 FPS...`);
    }
  };

  const handleOpenDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetails(card);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpenDetails(card)}
      className={`skeleton-card group cursor-pointer font-cartoon relative w-full rounded-2xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:border-[#00f2fe] transition-all duration-200 transform-gpu ${
        aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[2/3]'
      }`}
    >
      {/* 1. Crystal-Clear TMDB Poster/Backdrop Image (ALWAYS visible, NO black screen) */}
      <div className="absolute inset-0 pointer-events-none">
        <TmdbImage item={card}
          showId={card.id}
          id={card.id}
          tmdbId={card.tmdbId || card.id}
          imdbId={card.imdbId}
                    title={card.title || card.name}
          posterPath={card.poster_path}
          posterUrl={card.posterUrl || card.resolvedPosterUrl}
          alt={card.title || card.name}
          mediaType={card.mediaType}
          backdropPath={backdropPath}
          type={aspectRatio === '16:9' ? 'backdrop' : 'poster'}
          name={card.name}
          genres={card.genreTags}
          qualityBadge={card.qualityBadges?.[0] || '4K UHD'}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out transform-gpu"
        />
      </div>

      {/* 2. Soft Gradient at bottom only for text legibility (Does NOT cover the artwork) */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#07151e] via-[#07151e]/60 to-transparent pointer-events-none z-[4]" />

      {/* 3. Top Badges: Rank, 4K UHD, Match % */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5">
          {rank !== undefined ? (
            <div className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white font-black text-[11px] border border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
              #{rank}
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-lg bg-[#07151e]/90 backdrop-blur-sm border border-black text-[9px] font-black text-[#ccfbf1] shadow-[1px_1px_0px_#000000]">
              {card.qualityBadges?.[0] || '4K UHD'}
            </div>
          )}

          {card.isFeatured && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] border border-black shadow-[1px_1px_0px_#000000] animate-ping" />
          )}
        </div>

        <span className="px-2 py-0.5 rounded-full bg-[#14b8a6] border border-black text-black font-black text-[9px] sm:text-[10px] shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
          {matchScore}%
        </span>
      </div>

      {/* 4. Default Bottom Title & Info (Smoothly fades when mini preview box opens) */}
      <div className={`absolute bottom-0 inset-x-0 p-3 z-10 space-y-1 transition-opacity duration-200 ${
        showMiniPreview ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate drop-shadow-[1.5px_1.5px_0px_#000000]">
          {displayTitle}
        </h4>

        <div className="flex items-center gap-1.5 text-[10px] text-[#99f6e4]">
          <span className="px-1.5 py-0.2 rounded bg-[#14b8a6] border border-black text-black font-black text-[9px] shadow-[1px_1px_0px_#000000] modern-cartoony-number shrink-0">
            {duration}m
          </span>
          <span className="truncate font-bold text-[#ccfbf1] text-[10px]">
            {card.genreTags?.slice(0, 2).join(' • ') || 'Animation'}
          </span>
        </div>
      </div>

      {/* 5. Mini Preview Box (Mini 2nd Page Preview on Hover with dedicated 16:9 Scene Preview Artwork) */}
      <div className={`absolute inset-x-2 bottom-2 z-20 p-2.5 rounded-xl bg-[#07151e] border-2 border-[#00f2fe] shadow-[6px_6px_0px_#000000] transition-all duration-200 transform-gpu ${
        showMiniPreview 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
      }`}>
        {(isHovered || showMiniPreview) && (
          <>
            {/* Crisp 16:9 Scene Preview Banner (Visual Preview of 2nd Page) */}
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-black/80 mb-2 bg-[#040a0f] shadow-[2px_2px_0px_#000000]">
              <TmdbImage item={card}
                showId={card.id}
                id={card.id}
                tmdbId={card.tmdbId || card.id}
                imdbId={card.imdbId}
                title={card.title || card.name}
                posterPath={card.poster_path}
                posterUrl={card.posterUrl || card.resolvedPosterUrl}
                alt={card.title || card.name}
                mediaType={card.mediaType}
                backdropPath={backdropPath || posterPath}
                type="backdrop"
                name={card.name}
                genres={card.genreTags}
                qualityBadge="4K PREVIEW"
                className="w-full h-full object-cover object-center transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
                <span className="px-1.5 py-0.2 rounded-md bg-[#14b8a6] text-black font-black text-[8px] border border-black shadow-[1px_1px_0px_#000000]">
                  4K SAKUGA
                </span>
                <span className="px-1 py-0.2 rounded-md bg-black/80 text-[#00f2fe] font-black text-[8px] border border-black">
                  120 FPS
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-black/70 border border-[#00f2fe] flex items-center justify-center text-[#00f2fe] shadow-[2px_2px_0px_#000000] group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-[#00f2fe] ml-0.5" />
                </div>
              </div>
            </div>

            {/* Header of Mini Preview Box */}
            <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-black/60">
              <span className="text-[10px] font-black text-[#00f2fe] uppercase tracking-wider truncate flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                <span>2nd Page Preview</span>
              </span>
              <span className="text-[9px] font-black text-black bg-[#38bdf8] px-1.5 py-0.2 rounded border border-black">
                {duration}m • {matchScore}%
              </span>
            </div>

            {/* Title & Genre Tags */}
            <div className="space-y-0.5 mb-1.5">
              <h5 className="font-black text-[11px] sm:text-xs text-white leading-tight truncate">
                {displayTitle}
              </h5>
              <div className="flex flex-wrap gap-1">
                {(card.genreTags || ['Animation', 'Action']).slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="px-1 py-0.2 rounded bg-[#0d2836] text-[8px] sm:text-[9px] font-black text-[#ccfbf1] border border-black/60 truncate">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mini Synopsis / 2nd Page Snippet */}
            {card.overview && (
              <p className="text-[9px] text-[#99f6e4] line-clamp-2 leading-snug mb-2 font-medium">
                {card.overview}
              </p>
            )}

            {/* Action Controls inside Mini Preview Box */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-black/60">
              
              {/* Primary "Details" Button (Navigates directly to 2nd page) */}
              <button
                onClick={handleOpenDetailsClick}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-[#0d2836] hover:bg-[#14b8a6] text-white hover:text-black font-black text-[10px] border border-black shadow-[1.5px_1.5px_0px_#000000] transition-colors cursor-pointer"
                title="Open full dedicated show page"
              >
                <Info className="w-3 h-3 text-[#00f2fe]" />
                <span>Details</span>
              </button>

              {/* Quick Play Action */}
              <button
                onClick={handleQuickPlay}
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black font-black text-[10px] border border-black shadow-[1.5px_1.5px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Stream in 4K 120 FPS"
              >
                <Play className="w-2.5 h-2.5 fill-black" />
                <span>Watch</span>
              </button>

              {/* Quick List Toggle */}
              <button
                onClick={handleToggleList}
                className={`p-1 rounded-lg border border-black transition-colors cursor-pointer ${
                  isInList ? 'bg-[#14b8a6] text-black' : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6] hover:text-black'
                }`}
                title={isInList ? 'In Watchlist' : 'Add to Watchlist'}
              >
                {isInList ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 stroke-[3]" />}
              </button>

              {/* Quick Like */}
              <button
                onClick={handleToggleLike}
                className={`p-1 rounded-lg border border-black transition-colors cursor-pointer ${
                  isLiked ? 'bg-[#f43f5e] text-white' : 'bg-[#0d2836] text-white hover:text-[#f43f5e]'
                }`}
                title="Like"
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              </button>

            </div>
          </>
        )}
      </div>

    </div>
  );
});
