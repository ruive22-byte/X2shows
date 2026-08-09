import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, Plus, Check, Star, Sparkles, 
  Layers, Volume2, Calendar, Clock, Film, 
  Tv, Share2, Users, Shield, Zap, Eye, ChevronRight,
  Bookmark, Heart, Flame
} from 'lucide-react';
import { TmdbImage } from './TmdbImage';
import { TmdbAnimatedShow, TMDB_ANIMATED_CATALOG } from '../data/tmdbData';
import { 
  getFranchiseCollection, 
  FranchiseCollection, 
  FranchiseItem,
   
} from '../services/tmdbApi';
import { catalogRegistry } from '../services/catalog/catalogRegistry';
import { CatalogNormalizer } from '../utils/catalogNormalizer';
import { WatchProvidersData } from '../types/catalog';

interface ShowDetailPageProps {
  show: TmdbAnimatedShow;
  onBack: () => void;
  onPlayShow: (show: TmdbAnimatedShow, episodeNumber?: number) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: boolean;
  onSelectShow: (show: TmdbAnimatedShow) => void;
  onShowToast: (msg: string) => void;
}

export const ShowDetailPage: React.FC<ShowDetailPageProps> = ({
  show,
  onBack,
  onPlayShow,
  onToggleWatchlist,
  isInWatchlist,
  onSelectShow,
  onShowToast,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'collection' | 'recommended' | 'episodes' | 'cast'>('collection');
  const [franchise, setFranchise] = useState<FranchiseCollection | null>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProvidersData | null>(
    (show as any).watchProviders || null
  );
  const [recommendedShows, setRecommendedShows] = useState<TmdbAnimatedShow[]>(() =>
    catalogRegistry.getRecommended(show)
  );

  // Scroll to top when show changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRecommendedShows(catalogRegistry.getRecommended(show));
    setWatchProviders((show as any).watchProviders || null);

    let isMounted = true;
    catalogRegistry.getWatchProviders(show).then((providers) => {
      if (isMounted && providers) {
        setWatchProviders(providers);
      }
    });
    getFranchiseCollection(show).then((collection) => {
      if (isMounted && !collection && activeTab === 'collection') {
        setActiveTab('recommended');
      }
      if (isMounted) {
        setFranchise(collection);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [show]);

  const displayTitle = show.title || show.name || 'Animated Masterpiece';
  const releaseDateText = show.first_air_date || show.release_date || '2024';
  const formattedDate = releaseDateText.includes('-') 
    ? new Date(releaseDateText).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : releaseDateText;

  const matchPercent = show.matchScore || (show.vote_average ? Math.round(show.vote_average * 10) : 98);
  const durationText = show.media_type === 'tv' 
    ? `${show.seasonCount || 1} Season${(show.seasonCount || 1) > 1 ? 's' : ''} • ${show.totalEpisodes || 12} Episodes`
    : `${show.durationMinutes || 112} mins (Feature)`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onShowToast(`Copied 4K share link for "${displayTitle}"!`);
    } else {
      onShowToast(`Sharing "${displayTitle}" in 4K HDR`);
    }
  };

  const handleStartWatchParty = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    onShowToast(`Started 120 FPS Watch Party for "${displayTitle}"! Room: #${code}`);
  };

  const handleSelectFranchiseEntry = (item: FranchiseItem) => {
    const searchTitle = item.title.toLowerCase().trim();
    const matched = catalogRegistry.getAll().find(s => 
      s.id === item.id ||
      (item.tmdbId && s.tmdbId === item.tmdbId) ||
      (s.title || s.name || '').toLowerCase().trim() === searchTitle
    ) || TMDB_ANIMATED_CATALOG.find(s => 
      s.id === item.id ||
      (item.tmdbId && s.tmdbId === item.tmdbId) ||
      (s.title || s.name || '').toLowerCase().trim() === searchTitle
    );

    if (matched) {
      onSelectShow(matched);
      onShowToast(`Loaded ${item.title} from ${franchise?.universeName || 'Franchise'}`);
    } else {
      const synthesized = CatalogNormalizer.normalizeShow({
        id: item.id,
        tmdbId: item.tmdbId,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        posterUrl: item.posterUrl,
        backdropUrl: item.backdropUrl,
        overview: item.overview,
        vote_average: item.rating,
        genres: item.genres,
        release_date: typeof item.year === 'string' ? item.year.split(' ')[0] : String(item.year || 2023),
        first_air_date: typeof item.year === 'string' ? item.year.split(' ')[0] : String(item.year || 2023),
        tagline: item.roleInUniverse || '',
      });
      onSelectShow(synthesized);
      onShowToast(`Navigated to ${item.title} in franchise timeline`);
    }
  };

  return (
    <div className="min-h-screen bg-[#040a0f] text-[#f0fdfa] font-cartoon pb-24 anim-tab-fade-slide">
      
      {/* Top Sticky Navigation Bar with Back Button and Quick Watch Action */}
      <div className="sticky top-0 z-40 bg-[#07151e]/95 backdrop-blur-md border-b-2 border-black px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] text-white hover:text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Catalog</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#99f6e4]">
          <span className="text-[#7dd3fc]">X2 SHOWS TOON</span>
          <span>/</span>
          <span className="text-[#14b8a6]">{show.navType}</span>
          <span>/</span>
          <span className="text-white font-black truncate max-w-[200px]">{displayTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleWatchlist(show.id)}
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer ${
              isInWatchlist
                ? 'bg-[#14b8a6] text-black'
                : 'bg-[#0d2836] text-white hover:bg-[#14b8a6] hover:text-black'
            }`}
          >
            {isInWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{isInWatchlist ? 'In List' : 'Add to List'}</span>
          </button>

          <button
            onClick={() => onPlayShow(show, 1)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0284c7] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white hover:text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Now</span>
          </button>
        </div>
      </div>

      {/* Hero Cinematic Section with Dynamic Reacting Backdrop & Cover Poster */}
      <div className="relative w-full overflow-hidden bg-[#07151e] border-b-4 border-black">
        {/* Full-bleed Backdrop with atmospheric gradients */}
        <div className="absolute inset-0 h-[480px] sm:h-[580px] overflow-hidden">
          <TmdbImage item={show}
            backdropPath={show.backdropUrl || show.backdrop_path}
            posterPath={show.posterUrl || show.poster_path}
            type="backdrop"
            title={displayTitle}
            name={show.name}
            genres={show.genres}
            qualityBadge="4K UHD"
            className="w-full h-full object-cover object-top opacity-50 filter brightness-90 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040a0f] via-[#040a0f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a0f] via-[#040a0f]/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Show Cover Poster with Stagger Reaction & 4K Badges */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="group relative aspect-[2/3] max-w-[320px] mx-auto lg:max-w-none rounded-3xl overflow-hidden bg-[#07151e] border-[3px] border-black shadow-[8px_8px_0px_#000000] hover:shadow-[10px_10px_0px_#00f2fe] transition-all duration-300">
                <TmdbImage item={show}
                  posterPath={show.posterUrl || show.poster_path}
                  backdropPath={show.backdropUrl || show.backdrop_path}
                  type="poster"
                  title={displayTitle}
                  name={show.name}
                  genres={show.genres}
                  qualityBadge="4K UHD"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Corner Quality Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white font-black text-[11px] border-2 border-black shadow-[2px_2px_0px_#000000]">
                    4K ULTRA HD
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-[#facc15] text-black font-black text-[11px] border-2 border-black shadow-[2px_2px_0px_#000000] modern-cartoony-number">
                    ★ {show.vote_average || 9.5}
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-3 z-10">
                  <button
                    onClick={() => onPlayShow(show, 1)}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Instant 4K Play</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Show Details & Interactive Controls */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
              
              {/* Badge Bar: Universe, Quality & Match Score */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#14b8a6] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] uppercase tracking-wider">
                  {show.media_type === 'tv' ? '📺 TV SERIES' : '🎬 ANIMATED MOVIE'}
                </span>

                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#38bdf8] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
                  {matchPercent}% MATCH
                </span>

                <span className="px-2.5 py-1 rounded-full bg-[#07151e] text-[#7dd3fc] font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000]">
                  120 FPS SAKUGA
                </span>

                <span className="px-2.5 py-1 rounded-full bg-[#07151e] text-[#facc15] font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000]">
                  DOLBY ATMOS
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[2px_2px_0px_#000000]">
                  {displayTitle}
                </h1>
                {show.tagline && (
                  <p className="text-sm sm:text-base text-[#00f2fe] font-bold italic">
                    "{show.tagline}"
                  </p>
                )}
              </div>

              {/* Date It Was Made & Metadata Specs Row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm font-bold text-[#ccfbf1] p-3 rounded-2xl bg-[#07151e]/80 border-2 border-black shadow-[3px_3px_0px_#000000]">
                <div className="flex items-center gap-1.5 text-white">
                  <Calendar className="w-4 h-4 text-[#14b8a6]" />
                  <span>Made / Premiered: <strong className="text-[#00f2fe]">{formattedDate}</strong></span>
                </div>

                <span className="text-black font-black">•</span>

                <div className="flex items-center gap-1.5 text-white">
                  <Clock className="w-4 h-4 text-[#14b8a6]" />
                  <span>{durationText}</span>
                </div>

                <span className="text-black font-black">•</span>

                <div className="flex items-center gap-1.5 text-white">
                  <Shield className="w-4 h-4 text-[#14b8a6]" />
                  <span>Rating: <strong className="text-[#facc15]">{show.vote_average || 9.5}/10 ({show.vote_count || '2.8k'} votes)</strong></span>
                </div>

                <span className="text-black font-black">•</span>

                <div className="flex items-center gap-1.5 text-white">
                  <Layers className="w-4 h-4 text-[#14b8a6]" />
                  <span>Studio: <strong className="text-white">{show.studio || 'Sakuga Animation'}</strong></span>
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(show.genres || ['Animation', 'Action', 'Sci-Fi']).map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6] hover:text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] transition-colors cursor-default"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Overview / Story Synopsis */}
              <p className="text-sm sm:text-base text-[#f0fdfa] leading-relaxed font-medium bg-[#07151e]/40 p-4 rounded-2xl border border-black/50">
                {show.overview || 'An extraordinary animated production rendered with dynamic frame rate shifts, stunning character design, and breathtaking combat choreography.'}
              </p>

              {/* Streaming Availability Badges (Watch Providers) */}
              {watchProviders && (watchProviders.flatrate?.length || watchProviders.buy?.length || watchProviders.rent?.length) ? (
                <div className="p-3.5 rounded-2xl bg-[#07151e]/90 border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#14b8a6] uppercase tracking-wider">
                    <Tv className="w-4 h-4 text-[#00f2fe]" />
                    <span>Streaming Provider Availability</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-[#99f6e4]">Stream:</span>
                        {watchProviders.flatrate.map((provider) => (
                          <div key={provider.providerId} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d2836] border border-black rounded-xl shadow-[1px_1px_0px_#000000]" title={provider.providerName}>
                            {provider.logoPath && (
                              <img src={provider.logoPath} alt={provider.providerName} className="w-4 h-4 rounded object-cover" />
                            )}
                            <span className="text-xs font-black text-white">{provider.providerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {watchProviders.buy && watchProviders.buy.length > 0 && (!watchProviders.flatrate || watchProviders.flatrate.length === 0) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-[#99f6e4]">Buy / Rent:</span>
                        {watchProviders.buy.slice(0, 4).map((provider) => (
                          <div key={provider.providerId} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d2836] border border-black rounded-xl shadow-[1px_1px_0px_#000000]" title={provider.providerName}>
                            {provider.logoPath && (
                              <img src={provider.logoPath} alt={provider.providerName} className="w-4 h-4 rounded object-cover" />
                            )}
                            <span className="text-xs font-black text-white">{provider.providerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Action Buttons Row: Watch Now, Add to List, Watch Party, Share */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="detail-watch-now-btn"
                  onClick={() => onPlayShow(show, 1)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#0284c7] text-black font-black text-sm border-[2.5px] border-black shadow-[4px_4px_0px_#000000] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-black stroke-black" />
                  <span>WATCH NOW (EPISODE 1)</span>
                </button>

                <button
                  id="detail-add-list-btn"
                  onClick={() => {
                    onToggleWatchlist(show.id);
                    onShowToast(!isInWatchlist ? `Added "${displayTitle}" to Watchlist!` : `Removed "${displayTitle}" from Watchlist`);
                  }}
                  className={`px-5 py-3.5 rounded-2xl border-[2.5px] border-black font-black text-xs sm:text-sm shadow-[4px_4px_0px_#000000] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer ${
                    isInWatchlist
                      ? 'bg-[#14b8a6] text-black'
                      : 'bg-[#0d2836] text-white hover:bg-[#14b8a6] hover:text-black'
                  }`}
                >
                  {isInWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
                  <span>{isInWatchlist ? 'IN MY WATCHLIST' : 'ADD TO WATCHLIST'}</span>
                </button>

                <button
                  onClick={handleStartWatchParty}
                  className="px-4 py-3.5 rounded-2xl bg-[#0d2836] hover:bg-[#38bdf8] text-white hover:text-black border-2 border-black font-black text-xs shadow-[3px_3px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Host 120 FPS Watch Party"
                >
                  <Users className="w-4 h-4" />
                  <span>WATCH PARTY</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-[#0d2836] hover:bg-[#facc15] text-white hover:text-black border-2 border-black font-black shadow-[3px_3px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  title="Share show"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Tabs for Franchise Collection, Recommended Shows & Episodes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-3 border-b-2 border-black pb-4 overflow-x-auto no-scrollbar">
          {franchise && (
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs sm:text-sm transition-all cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center gap-2 shrink-0 ${
              activeTab === 'collection'
                ? 'bg-[#00f2fe] text-black scale-105'
                : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>RELATED ({franchise.items.length})</span>
          </button>
          )}

          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs sm:text-sm transition-all cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center gap-2 shrink-0 ${
              activeTab === 'recommended'
                ? 'bg-[#00f2fe] text-black scale-105'
                : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>RECOMMENDED ({recommendedShows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('episodes')}
            className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs sm:text-sm transition-all cursor-pointer shadow-[2px_2px_0px_#000000] flex items-center gap-2 shrink-0 ${
              activeTab === 'episodes'
                ? 'bg-[#facc15] text-black scale-105'
                : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>EPISODE GUIDE & SEASONS</span>
          </button>
        </div>

        {/* 1. SCROLLING DOWN: FRANCHISE & UNIVERSE SAGA CHRONOLOGY SECTION */}
        {/* For Ben 10 (when he was a little kid -> Alien Force -> Ultimate Alien -> Omniverse -> Movies) */}
        {/* For Arcane, Avatar, Dragon Ball, Spider-Verse, etc. */}
        {franchise && (
        <section id="franchise-collection-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-[#07151e] via-[#0d2836] to-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#14b8a6] text-black font-black text-[10px] border border-black uppercase">
                  Canon Timeline
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {franchise.universeName}
                </h2>
              </div>
              <p className="text-xs text-[#99f6e4] mt-0.5">
                {franchise.tagline}
              </p>
            </div>

            <span className="text-xs font-black text-[#00f2fe] bg-black/40 px-3 py-1.5 rounded-xl border border-black shrink-0">
              {franchise.items.length} Chronological Entries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {franchise.items.map((item, index) => {
              const isCurrent = item.title.toLowerCase().includes(displayTitle.toLowerCase()) || displayTitle.toLowerCase().includes(item.title.toLowerCase());
              return (
                <div
                  key={`franchise-${item.id}-${index}`}
                  onClick={() => handleSelectFranchiseEntry(item)}
                  className={`group relative rounded-3xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:border-[#00f2fe] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isCurrent ? 'ring-2 ring-[#00f2fe]' : ''
                  }`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#0a2330]">
                    <TmdbImage item={item}
                      posterPath={item.posterUrl || item.poster_path}
                      backdropPath={item.backdropUrl || item.backdrop_path}
                      type="backdrop"
                      title={item.title}
                      genres={item.genres}
                      qualityBadge={item.qualityBadge || '4K UHD'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-transparent to-black/40" />

                    {/* Timeline Step Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#14b8a6] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000]">
                        PHASE {index + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/80 text-white font-black text-[10px] border border-black">
                        {item.year}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 rounded-full bg-[#facc15] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number">
                        ★ {item.rating}
                      </span>
                    </div>

                    {isCurrent && (
                      <div className="absolute bottom-2 left-3 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-[#00f2fe] text-black font-black text-[9px] uppercase tracking-wider border border-black">
                          Currently Viewing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white group-hover:text-[#00f2fe] transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[#7dd3fc] font-bold mt-0.5">
                        {item.roleInUniverse}
                      </p>
                      <p className="text-xs text-[#ccfbf1] line-clamp-3 leading-relaxed mt-2">
                        {item.overview}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/40 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-[#99f6e4]">
                        {item.episodesCount ? `${item.episodesCount} Episodes` : 'Feature Film'}
                      </span>
                      <span className="text-[#00f2fe] font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Open Guide</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* 2. SCROLLING EVEN MORE DOWN: RELATED & RECOMMENDED SHOWS SECTION */}
        <section id="recommended-shows-section" className="space-y-6 pt-6 border-t-2 border-black/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#f43f5e]" />
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Shows Related to "{displayTitle}"
                </h2>
              </div>
              <p className="text-xs text-[#99f6e4] mt-0.5">
                AI-curated recommendations based on animation studio, visual aesthetic, and genre DNA
              </p>
            </div>

            <span className="text-xs font-black text-[#14b8a6] bg-[#07151e] px-3 py-1.5 rounded-xl border border-black">
              {recommendedShows.length} Matches
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendedShows.map((recShow, index) => {
              const recTitle = recShow.title || recShow.name || 'Recommended Toon';
              const recScore = recShow.matchScore || Math.round(recShow.vote_average * 10);
              return (
                <div
                  key={`rec-${recShow.id}-${index}`}
                  onClick={() => {
                    onSelectShow(recShow);
                    onShowToast(`Navigated to ${recTitle}`);
                  }}
                  className="group relative rounded-2xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:border-[#00f2fe] transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#0a2330]">
                    <TmdbImage item={recShow}
                      posterPath={recShow.posterUrl || recShow.poster_path}
                      backdropPath={recShow.backdropUrl || recShow.backdrop_path}
                      type="poster"
                      title={recTitle}
                      name={recShow.name}
                      genres={recShow.genres}
                      qualityBadge="4K UHD"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-transparent to-transparent" />

                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#14b8a6] text-black font-black text-[9px] border border-black modern-cartoony-number shadow-[1px_1px_0px_#000000]">
                        {recScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h4 className="font-black text-xs text-white group-hover:text-[#00f2fe] transition-colors truncate">
                      {recTitle}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#99f6e4] font-bold">
                      <span className="truncate">{recShow.genres?.[0] || 'Sakuga'}</span>
                      <span className="text-[#facc15]">★ {recShow.vote_average}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. EPISODE GUIDE & SEASONS BROWSER */}
        <section id="episodes-guide-section" className="space-y-6 pt-6 border-t-2 border-black/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Episodes & Season Guide
              </h2>
              <p className="text-xs text-[#99f6e4]">
                Stream in full 4K 120 FPS Sakuga with zero buffering
              </p>
            </div>

            {/* Season Selector */}
            <div className="flex items-center gap-2">
              {[1, 2].map((sNum) => (
                <button
                  key={sNum}
                  onClick={() => setSelectedSeason(sNum)}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer shadow-[2px_2px_0px_#000000] ${
                    selectedSeason === sNum
                      ? 'bg-[#facc15] text-black'
                      : 'bg-[#07151e] text-[#99f6e4] hover:bg-[#0d2836]'
                  }`}
                >
                  Season {sNum}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((epNum) => {
              const epTitles = [
                'The Awakening of Power',
                'Dual Convictions in Conflict',
                'The Base Violence for Change',
                'Crest of the Hextech',
                'When the Walls Come Down',
                'The Monster You Created'
              ];
              const epTitle = epTitles[epNum - 1] || `Episode ${epNum}`;
              return (
                <div
                  key={epNum}
                  onClick={() => onPlayShow(show, epNum)}
                  className="group p-3 rounded-2xl bg-[#07151e] border-2 border-black shadow-[3px_3px_0px_#000000] hover:border-[#00f2fe] hover:shadow-[5px_5px_0px_#000000] transition-all cursor-pointer flex gap-3 items-center"
                >
                  <div className="relative w-28 aspect-[16/10] rounded-xl overflow-hidden bg-[#0d2836] border border-black shrink-0">
                    <TmdbImage item={show}
                      posterPath={show.posterUrl || show.poster_path}
                      backdropPath={show.backdropUrl || show.backdrop_path}
                      type="backdrop"
                      title={displayTitle}
                      genres={show.genres}
                      qualityBadge="4K UHD"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-black border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000] group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] font-black text-[#14b8a6]">
                      <span>EP {epNum}</span>
                      <span className="text-[#99f6e4]">24 mins</span>
                    </div>
                    <h4 className="font-black text-xs text-white group-hover:text-[#00f2fe] transition-colors truncate">
                      {epTitle}
                    </h4>
                    <p className="text-[10px] text-[#ccfbf1] line-clamp-2">
                      Dynamic action sequence rendered with 120 FPS frame rate shifting and vivid color palette.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
