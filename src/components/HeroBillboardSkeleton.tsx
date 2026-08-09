import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Plus, 
  Info, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Zap, 
  Check, 
  Film,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tv
} from 'lucide-react';
import { 
  TmdbAnimatedShow, 
  TMDB_ANIMATED_CATALOG, 
  getTmdbTitle, 
  getTmdbBackdropUrl, 
  getTmdbMatchScore 
} from '../data/tmdbData';
import { TmdbImage } from './TmdbImage';

interface HeroBillboardSkeletonProps {
  heroItem?: TmdbAnimatedShow;
  spotlightShows?: TmdbAnimatedShow[];
  onOpenCardDetails: (cardId: string) => void;
  onPlayHero?: (show?: TmdbAnimatedShow) => void;
  onReplayIntro?: () => void;
  onShowToast: (msg: string) => void;
}

export const HeroBillboardSkeleton: React.FC<HeroBillboardSkeletonProps> = React.memo(({
  heroItem,
  spotlightShows,
  onOpenCardDetails,
  onPlayHero,
  onReplayIntro,
  onShowToast
}) => {
  // Top 10 rotation shows
  const rotationList: TmdbAnimatedShow[] = React.useMemo(() => {
    if (spotlightShows && spotlightShows.length >= 10) {
      return spotlightShows.slice(0, 10);
    }
    if (spotlightShows && spotlightShows.length > 0) {
      const combined = [...spotlightShows, ...TMDB_ANIMATED_CATALOG];
      const seen = new Set<string>();
      return combined.filter(s => {
        if (!s || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      }).slice(0, 10);
    }
    return TMDB_ANIMATED_CATALOG.slice(0, 10);
  }, [spotlightShows]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingSimulated, setIsPlayingSimulated] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isInList, setIsInList] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(7);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const currentShow = rotationList[currentIndex] || heroItem || TMDB_ANIMATED_CATALOG[0];

  // 7-second auto-advance timer with 1s interval to minimize React re-renders
  const ROTATION_DURATION_MS = 7000;

  const triggerNextShow = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % rotationList.length);
      setSecondsLeft(7);
      setIsTransitioning(false);
    }, 250);
  };

  const triggerPrevShow = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + rotationList.length) % rotationList.length);
      setSecondsLeft(7);
      setIsTransitioning(false);
    }, 250);
  };

  const handleSelectIndex = (idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setSecondsLeft(7);
      setIsTransitioning(false);
    }, 200);
    onShowToast(`Spotlight switched to #${idx + 1}: ${getTmdbTitle(rotationList[idx])}`);
  };

  useEffect(() => {
    if (isPaused || isPlayingSimulated) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          triggerNextShow();
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, isPlayingSimulated, rotationList.length]);

  // Dynamic Title Alignment & Details
  const displayTitle = currentShow ? getTmdbTitle(currentShow) : 'Arcane';
  const overview = currentShow?.overview || 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.';
  const matchScore = currentShow ? getTmdbMatchScore(currentShow) : 99;
  const genres = currentShow?.genres || ['Animation', 'Sci-Fi', 'Dark Fantasy'];
  const releaseYear = currentShow?.first_air_date 
    ? new Date(currentShow.first_air_date).getFullYear() 
    : (currentShow?.release_date ? new Date(currentShow.release_date).getFullYear() : 2024);

  const handleSimulatePlay = () => {
    const nextState = !isPlayingSimulated;
    setIsPlayingSimulated(nextState);
    if (nextState && onPlayHero) {
      onPlayHero(currentShow);
    }
    onShowToast(nextState ? `Playing 4K "${displayTitle}" Spotlight stream buffer...` : 'Preview Paused');
  };

  const handleToggleList = () => {
    setIsInList(!isInList);
    onShowToast(!isInList ? `Added "${displayTitle}" Spotlight to My List` : `Removed "${displayTitle}" from My List`);
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6 font-cartoon animate-category-fade"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border-[3px] border-black bg-[#07151e] shadow-[6px_6px_0px_#000000] group">
        
        {/* Exact TMDB Backdrop with 7-Second Animated Cross-Fade */}
        <div className={`absolute inset-0 transition-all duration-500 ease-out transform ${
          isTransitioning ? 'opacity-40 scale-105 filter blur-xs' : 'opacity-100 scale-100 filter blur-0'
        }`}>
          <TmdbImage
            key={currentShow.id}
            showId={currentShow.id}
            id={currentShow.id}
            backdropPath={currentShow.backdropUrl || currentShow.backdrop_path}
            posterPath={currentShow.posterUrl || currentShow.poster_path}
            type="backdrop"
            title={displayTitle}
            name={currentShow.name}
            genres={genres}
            qualityBadge={currentShow.qualityBadges?.[0] || '4K UHD'}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </div>

        {/* Subtle, neutral cinematic edge blend - removes heavy cyan/teal hue overlays and lets the crisp artwork shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a0f] via-[#040a0f]/35 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#040a0f]/60 via-transparent to-transparent z-10 pointer-events-none" />

        {/* 7-Second Real-Time Countdown Progress Bar (Top Edge) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/60 z-30 overflow-hidden">
          <div 
            key={`top-progress-${currentIndex}-${isPaused}-${isPlayingSimulated}`}
            className="h-full bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] shadow-[0_0_8px_#00f2fe]"
            style={{
              animationName: 'progressGrow',
              animationDuration: `${ROTATION_DURATION_MS}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
              animationPlayState: isPaused || isPlayingSimulated ? 'paused' : 'running',
            }}
          />
        </div>

        {/* Simulated Video Buffer Scanning Bar (When Play is active) */}
        {isPlayingSimulated && (
          <div className="absolute inset-0 z-25 bg-black/75 backdrop-blur-[3px] flex items-center justify-center">
            <div className="text-center space-y-3 p-6 rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[6px_6px_0px_#000000] max-w-sm">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-black border-t-[#38bdf8] animate-spin" />
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white tracking-wide uppercase">
                  STREAMING: {displayTitle} (4K HDR)
                </p>
                <p className="text-xs text-[#99f6e4] font-bold">
                  TMDB Live Animation Stream Active
                </p>
              </div>
              <div className="w-52 h-2.5 bg-[#0d2836] rounded-full overflow-hidden mx-auto border-2 border-black">
                <div className="h-full bg-gradient-to-r from-[#14b8a6] via-[#0284c7] to-[#38bdf8] w-4/5 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Top Badges & 10-Show Rotation Live Indicator */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase border-2 border-black shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-3.5 h-3.5 text-[#bae6fd] animate-pulse" />
            <span>SPOTLIGHT #{currentIndex + 1} OF 10</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[#07151e]/90 backdrop-blur-xs border-2 border-black text-[11px] font-black text-[#f0fdfa] shadow-[2px_2px_0px_#000000] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#00f2fe]" />
            <span>7s ROTATION {isPaused ? '(PAUSED)' : ''}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[#07151e]/90 backdrop-blur-xs border-2 border-black text-[11px] font-black text-[#7dd3fc] shadow-[2px_2px_0px_#000000] hidden sm:inline-block">
            4K ULTRA HD • 120 FPS
          </div>
        </div>

        {/* Top Right Controls: Sound Toggle & Quick Prev/Next Arrow Controls */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
          {/* Quick Prev */}
          <button
            onClick={triggerPrevShow}
            className="p-2.5 sm:p-3 rounded-full bg-[#07151e]/90 hover:bg-[#14b8a6] hover:text-black border-2 border-black text-white shadow-[3px_3px_0px_#000000] backdrop-blur-xs transition-all hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Previous Spotlight Show"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick Next */}
          <button
            onClick={triggerNextShow}
            className="p-2.5 sm:p-3 rounded-full bg-[#07151e]/90 hover:bg-[#14b8a6] hover:text-black border-2 border-black text-white shadow-[3px_3px_0px_#000000] backdrop-blur-xs transition-all hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Next Spotlight Show (7s Auto-Advance)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Mute Button */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              onShowToast(isMuted ? 'Simulated Cartoon Audio Enabled' : 'Simulated Audio Muted');
            }}
            className="p-2.5 sm:p-3 rounded-full bg-[#07151e]/90 hover:bg-[#14b8a6] hover:text-black border-2 border-black text-white shadow-[3px_3px_0px_#000000] backdrop-blur-xs transition-all hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title={isMuted ? 'Unmute preview' : 'Mute preview'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#99f6e4]" /> : <Volume2 className="w-4 h-4 text-[#38bdf8]" />}
          </button>
        </div>

        {/* Bottom Left Hero Pairing: High-Quality Frosted Glass Panel (Guarantees Sharpness & Zero Full-Screen Hue) */}
        <div className={`absolute bottom-3 sm:bottom-6 left-3 sm:left-6 z-20 max-w-xl transition-all duration-300 ${
          isTransitioning ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'
        }`}>
          
          <div className="p-3.5 sm:p-5 rounded-3xl bg-[#07151e]/85 backdrop-blur-md border-2 border-black shadow-[6px_6px_0px_#000000] space-y-2 sm:space-y-3">
            
            {/* Real Title with Live Studio Indicator */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] border border-black shadow-[1px_1px_0px_#000000] animate-ping" />
                <span className="text-[11px] sm:text-xs font-black text-[#99f6e4] tracking-widest uppercase">
                  {currentShow?.studio || 'Fortiche Production'} • {releaseYear}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-none drop-shadow-[2px_2px_0px_#000000]">
                {displayTitle}
              </h1>
            </div>

            {/* Hero Spotlight Metadata: 98% MATCH & Genre Pills */}
            <div className="flex items-center gap-2 text-xs text-[#ccfbf1] flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#38bdf8] border-2 border-black text-black font-black text-[11px] sm:text-xs shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
                {matchScore}% MATCH
              </span>
              
              <span className="px-2 py-0.5 rounded-md bg-[#0d2836] border border-black text-[#7dd3fc] font-bold text-[10px] sm:text-[11px]">
                {currentShow?.media_type === 'movie' ? 'FEATURE FILM' : `${currentShow?.seasonCount || 1} ${currentShow?.seasonCount === 1 ? 'SEASON' : 'SEASONS'}`}
              </span>

              <span className="text-[#5eead4] font-black">•</span>
              <span className="font-bold text-white truncate max-w-[200px] text-[11px] sm:text-xs">
                {genres.slice(0, 3).join(' • ')}
              </span>
            </div>

            {/* Real TMDB Overview */}
            <p className="text-[11px] sm:text-xs md:text-sm text-[#e0f2fe] leading-relaxed line-clamp-2 sm:line-clamp-3 font-medium">
              {overview}
            </p>

            {/* Action Buttons with Modern Black Outlines & Comic Shadows */}
            <div className="flex items-center gap-2 sm:gap-2.5 pt-0.5 flex-wrap">
              <button
                onClick={handleSimulatePlay}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#14b8a6] via-[#0284c7] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white hover:text-black font-black text-xs sm:text-sm tracking-wide shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer border-2 border-black"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingSimulated ? 'Pause Stream' : 'Play Toon (4K)'}</span>
              </button>

              <button
                onClick={handleToggleList}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-black transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shadow-[2.5px_2.5px_0px_#000000] ${
                  isInList
                    ? 'bg-[#14b8a6] text-black'
                    : 'bg-[#07151e] hover:bg-[#0d2836] text-[#f0fdfa]'
                }`}
              >
                {isInList ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{isInList ? 'In Watchlist' : 'Add to List'}</span>
              </button>

              <button
                onClick={() => {
                  if (onReplayIntro) {
                    onReplayIntro();
                    onShowToast('Replaying 4-Second Cyber-Teal Cinematic Splash Intro...');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-2xl bg-[#00f2fe] hover:bg-[#38bdf8] border-2 border-black text-black font-black text-xs sm:text-sm transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[4px_4px_0px_#000000]"
                title="Replay 4-Second Cinematic Intro"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" />
                <span>Replay Intro</span>
              </button>

              <button
                onClick={() => {
                  onOpenCardDetails(currentShow.id);
                  onShowToast(`Opened details for ${displayTitle}`);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-2xl bg-[#07151e] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-[#f0fdfa] font-black text-xs sm:text-sm transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shadow-[2.5px_2.5px_0px_#000000]"
              >
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Details</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Right 10-Show Interactive Carousel Indicators (1 to 10) */}
        <div className="absolute bottom-4 right-4 sm:right-8 z-20 hidden md:flex flex-col items-end gap-2">
          
          {/* Live Progress pill */}
          <div className="flex items-center gap-2 bg-[#07151e]/90 px-3 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_#000000] backdrop-blur-xs">
            <span className="text-[10px] font-black text-[#7dd3fc]">SPOTLIGHT ROTATION</span>
            <div className="w-16 h-2 bg-[#0d2836] rounded-full overflow-hidden border border-black">
              <div 
                key={`pill-progress-${currentIndex}-${isPaused}-${isPlayingSimulated}`}
                className="h-full bg-gradient-to-r from-[#14b8a6] to-[#38bdf8]"
                style={{
                  animationName: 'progressGrow',
                  animationDuration: `${ROTATION_DURATION_MS}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                  animationPlayState: isPaused || isPlayingSimulated ? 'paused' : 'running',
                }}
              />
            </div>
            <span className="text-[10px] font-black text-[#00f2fe] modern-cartoony-number">
              {secondsLeft}s
            </span>
          </div>

          {/* 10 Carousel Selection Pills */}
          <div className="flex items-center gap-1.5 bg-[#07151e]/90 p-1.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000] backdrop-blur-xs">
            {rotationList.map((show, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={`spotlight-pill-${show.id}-${idx}`}
                  id={`spotlight-indicator-${idx + 1}`}
                  onClick={() => handleSelectIndex(idx)}
                  className={`relative px-2.5 py-1 rounded-xl text-[11px] font-black border-2 border-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black shadow-[2px_2px_0px_#000000] scale-110'
                      : 'bg-[#0d2836] text-[#99f6e4] hover:bg-[#14b8a6] hover:text-black'
                  }`}
                  title={`#${idx + 1}: ${getTmdbTitle(show)}`}
                >
                  <span>{idx + 1}</span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white border border-black animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
});

HeroBillboardSkeleton.displayName = 'HeroBillboardSkeleton';

