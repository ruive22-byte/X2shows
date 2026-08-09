import React, { useState, useEffect } from 'react';
import { 
  Play, Info, Volume2, VolumeX, Sparkles, Star, 
  Bookmark, Check, Users, ChevronLeft, ChevronRight,
  Tv, Film, Zap, Layers, Flame
} from 'lucide-react';
import { Show } from '../types';
import { TmdbImage } from './TmdbImage';

interface HeroCarouselProps {
  featuredShows: Show[];
  onPlayShow: (show: Show, episodeNumber?: number) => void;
  onOpenDetails: (show: Show) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: (showId: string) => boolean;
  onStartWatchParty: (show: Show) => void;
  soundFxEnabled: boolean;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredShows,
  onPlayShow,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
  onStartWatchParty,
  soundFxEnabled,
}) => {
  const top10Shows = featuredShows.slice(0, 10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentShow = top10Shows[currentIndex] || featuredShows[0];

  // Auto advance every 7 seconds unless paused
  useEffect(() => {
    if (autoPlayPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % top10Shows.length);
        setIsTransitioning(false);
      }, 250);
    }, 7000);
    return () => clearInterval(interval);
  }, [top10Shows.length, autoPlayPaused]);

  if (!currentShow) return null;

  const bookmarked = isInWatchlist(currentShow.id);

  return (
    <div 
      id="hero-carousel-section"
      className="relative w-full min-h-[75vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-[#0A090D]"
      onMouseEnter={() => setAutoPlayPaused(true)}
      onMouseLeave={() => setAutoPlayPaused(false)}
    >
      {/* Background Poster with Gradient and Maroon/Electric Blue Backglow */}
      <div className="absolute inset-0 z-0">
        <TmdbImage 
          showId={currentShow.id}
          tmdbId={currentShow.tmdbId}
          imdbId={currentShow.imdbId}
          id={currentShow.id}
          backdropPath={currentShow.backdropUrl}
          posterPath={currentShow.heroPosterUrl}
          type="backdrop"
          title={currentShow.title}
          genres={currentShow.genres}
          qualityBadge={currentShow.qualityBadges?.[0] || '4K UHD'}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out filter brightness-[0.7] contrast-[1.08]"
        />

        {/* Multi-layered cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A090D] via-[#0A090D]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A090D] via-[#0A090D]/80 to-transparent" />
        
        {/* Ambient Maroon & Electric Blue radial flares */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-900/30 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-600/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-purple-950/40 blur-[140px] pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full flex flex-col justify-end min-h-[75vh] lg:min-h-[85vh]">
        
        <div className="max-w-2xl lg:max-w-3xl space-y-4">
          
          {/* Top Pill Badges: Studio + Exclusive + Score + Quality */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 animate-fadeIn">
            
            {/* Exclusive Maroon Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-gradient-to-r from-rose-950 to-rose-900 text-rose-200 border border-rose-600/40 shadow-lg shadow-rose-950/60 uppercase">
              <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
              XTwo Spotlight #1
            </span>

            {/* Studio Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.08] backdrop-blur-md text-slate-200 border border-white/[0.12]">
              <Sparkles className="w-3 h-3 text-blue-400" />
              {currentShow.studio}
            </span>

            {/* Rating Score */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-950/60 text-amber-300 border border-amber-500/40">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {currentShow.score} / 10 Masterpiece
            </span>

            {/* 4K HDR Badge */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
              4K HDR • 120 FPS
            </span>

            {/* Animation Style Tag */}
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/50 text-purple-200 border border-purple-500/30">
              <Layers className="w-3 h-3 text-purple-400" />
              {currentShow.animationStyle}
            </span>
          </div>

          {/* Main Title & Japanese Subtitle */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] text-shadow-lg">
              {currentShow.title}
            </h1>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono-code text-rose-300/80">
              <span>{currentShow.japaneseTitle}</span>
              <span>•</span>
              <span className="text-slate-300">{currentShow.releaseYear}</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">{currentShow.seasonCount} Season ({currentShow.episodeCount} Episodes)</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                {currentShow.maturityRating}
              </span>
            </div>
          </div>

          {/* Tagline & Banner Quote */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium leading-relaxed line-clamp-2 sm:line-clamp-3 text-shadow">
            {currentShow.tagline}
          </p>

          {/* Genres Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {currentShow.genres.map((genre) => (
              <span 
                key={genre}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-slate-300 border border-white/[0.06]"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons: Play, Details, Watchlist, Watch Party */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            
            {/* Primary Watch Button with Maroon & Electric Blue Glow */}
            <button
              id="hero-play-main-btn"
              onClick={() => onPlayShow(currentShow, 1)}
              className="group relative flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#800020] via-rose-800 to-[#2563EB] hover:from-rose-700 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-rose-950/60 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 border border-rose-400/40"
            >
              <Play className="w-5 h-5 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>Watch Episode 1</span>
              <span className="text-xs font-normal opacity-80 pl-1 hidden sm:inline font-mono-code">
                (4K HDR)
              </span>
            </button>

            {/* Episode Guide & Lore Modal */}
            <button
              id="hero-details-btn"
              onClick={() => onOpenDetails(currentShow)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-sm backdrop-blur-md border border-white/[0.12] transition-all duration-200"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span>Episode Guide & Lore</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              id="hero-watchlist-toggle-btn"
              onClick={() => onToggleWatchlist(currentShow.id)}
              className={`p-3 rounded-xl backdrop-blur-md border transition-all duration-200 ${
                bookmarked
                  ? 'bg-rose-900/60 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/50'
                  : 'bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.12] text-slate-300 hover:text-white'
              }`}
              title={bookmarked ? "Remove from Watchlist" : "Save to Watchlist"}
            >
              {bookmarked ? <Check className="w-5 h-5 text-rose-300" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {/* Watch Party Quick Trigger */}
            <button
              id="hero-watch-party-btn"
              onClick={() => onStartWatchParty(currentShow)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-200 font-semibold text-xs transition-all"
              title="Invite friends for synchronized playback"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Watch Party</span>
            </button>

          </div>

        </div>

        {/* Carousel Bottom Controller: Thumbnails strip & Next/Prev */}
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Thumbnail navigation items */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-1">
            {featuredShows.map((show, idx) => (
              <button
                key={`hero-thumb-${show.id || idx}-${idx}`}
                id={`hero-thumb-${show.id || idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex items-center gap-2.5 p-1.5 rounded-xl transition-all duration-300 text-left shrink-0 ${
                  currentIndex === idx
                    ? 'bg-gradient-to-r from-rose-950/80 to-blue-950/80 border-2 border-rose-500 shadow-lg shadow-rose-950/60'
                    : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={show.heroPosterUrl} 
                  alt={show.title} 
                  className="w-12 h-8 sm:w-16 sm:h-10 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="pr-2 hidden md:block max-w-[130px]">
                  <div className="text-xs font-bold text-white truncate">{show.title}</div>
                  <div className="text-[10px] text-rose-300/80 font-mono-code">{show.studio}</div>
                </div>
                
                {/* Active progress bar */}
                {currentIndex === idx && (
                  <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-rose-500 to-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Arrows & Teaser Mute Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            
            {/* Audio Mute/Unmute for Trailer Teaser */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              <span className="hidden sm:inline text-[11px] font-mono-code">
                {isMuted ? 'Muted' : 'Audio On'}
              </span>
            </button>

            {/* Prev Show */}
            <button
              id="hero-prev-btn"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredShows.length) % featuredShows.length)}
              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Show */}
            <button
              id="hero-next-btn"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredShows.length)}
              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
