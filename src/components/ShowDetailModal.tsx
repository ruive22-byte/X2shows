import React, { useState, useEffect } from 'react';
import { 
  X, Play, Star, Bookmark, Check, Users, Sparkles, 
  Layers, Volume2, Clock, Calendar, Globe, Award, 
  MessageSquare, Heart, ChevronRight, Zap, Shield, 
  FileText, Film, Mic, Music, RefreshCw
} from 'lucide-react';
import { Show, Episode, Character, SoundtrackTrack, SakugaClip, Review } from '../types';
import { TmdbImage } from './TmdbImage';
import { fetchTvMazeEpisodes } from '../services/apiFallbackService';

interface ShowDetailModalProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayEpisode: (show: Show, episodeNumber: number) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: boolean;
  onStartWatchParty: (show: Show) => void;
  allShows: Show[];
  onSelectSimilarShow: (show: Show) => void;
}

export const ShowDetailModal: React.FC<ShowDetailModalProps> = ({
  show,
  isOpen,
  onClose,
  onPlayEpisode,
  onToggleWatchlist,
  isInWatchlist,
  onStartWatchParty,
  allShows,
  onSelectSimilarShow,
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'characters' | 'sakuga' | 'ost' | 'reviews'>('episodes');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [activeOstTrack, setActiveOstTrack] = useState<string | null>(null);
  const [isPlayingOst, setIsPlayingOst] = useState(false);
  const [userReviewText, setUserReviewText] = useState('');
  const [userReviewScore, setUserReviewScore] = useState(10);
  const [reviewsList, setReviewsList] = useState<Review[]>(show ? show.reviews : []);
  const [dynamicEpisodes, setDynamicEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);
  const [episodeSource, setEpisodeSource] = useState<'TMDB' | 'TVMAZE' | 'LOCAL_CACHE'>('TMDB');

  // Load episodes from TMDB or TVmaze fallback with LocalStorage caching
  useEffect(() => {
    if (!show) return;
    setReviewsList(show.reviews || []);
    
    if (show.episodes && show.episodes.length > 0) {
      setDynamicEpisodes(show.episodes);
      setEpisodeSource('TMDB');
    }

    // Try fetching live enriched TVmaze episode guide
    setIsLoadingEpisodes(true);
    fetchTvMazeEpisodes(show.title).then((tvmazeEps) => {
      if (tvmazeEps && tvmazeEps.length > 0) {
        setDynamicEpisodes(tvmazeEps);
        setEpisodeSource('TVMAZE');
      }
      setIsLoadingEpisodes(false);
    }).catch(() => {
      setIsLoadingEpisodes(false);
    });
  }, [show?.id, show?.title]);

  if (!isOpen || !show) return null;

  const currentEpisodesList = dynamicEpisodes.length > 0 ? dynamicEpisodes : (show.episodes || []);
  const filteredEpisodes = currentEpisodesList.filter(ep => (ep.season || 1) === selectedSeason);
  const displayEpisodes = filteredEpisodes.length > 0 ? filteredEpisodes : currentEpisodesList;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: 'You (XTwo VIP Member)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      score: userReviewScore,
      date: 'Just now',
      content: userReviewText,
      likes: 1,
      spoilerFree: true,
      tag: userReviewScore >= 9 ? 'Masterpiece' : 'Great Watch',
    };

    setReviewsList([newRev, ...reviewsList]);
    setUserReviewText('');
  };

  const similarShows = allShows.filter(s => show.similarShowIds?.includes(s.id));

  return (
    <div 
      id="show-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="show-detail-modal-container"
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0F0D15] border border-rose-900/40 shadow-2xl shadow-black my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-rose-900/80 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Hero Header with Dynamic Backdrop */}
        <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-[#181622]">
          <TmdbImage 
            showId={show.id}
            tmdbId={show.tmdbId}
            imdbId={show.imdbId}
            id={show.id}
            backdropPath={show.backdropUrl}
            posterPath={show.heroPosterUrl}
            type="backdrop"
            title={show.title}
            genres={show.genres}
            qualityBadge={show.qualityBadges?.[0] || '4K UHD'}
            className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D15] via-[#0F0D15]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0D15] via-[#0F0D15]/80 to-transparent" />

          {/* Glowing accents */}
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-rose-900/30 blur-[100px]" />
          <div className="absolute bottom-0 right-10 w-72 h-72 rounded-full bg-blue-600/25 blur-[100px]" />

          {/* Header text content */}
          <div className="absolute bottom-4 left-4 sm:left-8 sm:bottom-8 right-4 max-w-3xl space-y-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {show.score} Masterpiece
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono-code font-bold bg-blue-950/90 text-blue-300 border border-blue-500/40">
                {show.studio}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-purple-950/80 text-purple-200 border border-purple-500/30">
                {show.animationStyle}
              </span>
              <span className="text-xs font-mono-code text-slate-400">
                {show.releaseYear} • {show.seasonCount} Season • {show.episodeCount} Episodes
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
              {show.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl">
              {show.synopsis}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onPlayEpisode(show, 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] via-rose-800 to-[#2563EB] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-950/60 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Play Episode 1 (4K HDR)</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(show.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isInWatchlist
                    ? 'bg-rose-900 border-rose-500 text-rose-200'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4 text-rose-300" /> : <Bookmark className="w-4 h-4" />}
                <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={() => onStartWatchParty(show)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-200 text-xs font-bold transition-colors"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Start Watch Party</span>
              </button>
            </div>

          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-8 border-b border-white/[0.08] bg-[#0A090D]/60 overflow-x-auto">
          {[
            { id: 'episodes', label: 'Episodes Guide', icon: Film, count: show.episodes.length },
            { id: 'characters', label: 'Characters & Lore', icon: Users, count: show.characters.length },
            { id: 'sakuga', label: 'Sakuga & Animation Craft', icon: Sparkles, count: show.sakugaClips.length },
            { id: 'ost', label: 'Original Soundtrack (OST)', icon: Music, count: show.soundtracks.length },
            { id: 'reviews', label: 'Fan Reviews & Ratings', icon: MessageSquare, count: reviewsList.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`modal-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-rose-500 text-white font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.08] text-slate-300">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-8 max-h-[50vh] overflow-y-auto space-y-6">

          {/* TAB 1: EPISODES GUIDE */}
          {activeTab === 'episodes' && (
            <div className="space-y-4">
              
              {/* Season Picker if multiple seasons */}
              <div className="flex items-center justify-between gap-2 pb-2 flex-wrap">
                {(show.seasonCount || 1) > 1 ? (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: show.seasonCount || 1 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSeason(idx + 1)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSeason === idx + 1
                            ? 'bg-rose-900 text-white border border-rose-500'
                            : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.08]'
                        }`}
                      >
                        Season {idx + 1}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#00f2fe]">Season 1 Complete Collection</span>
                )}

                {/* API Fallback Status Indicator */}
                <div className="flex items-center gap-2 text-[10px] font-mono-code text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Dual Provider Fallback: <strong className="text-white">{episodeSource} Synced</strong></span>
                  {isLoadingEpisodes && <RefreshCw className="w-3 h-3 animate-spin text-[#00f2fe]" />}
                </div>
              </div>

              {/* Episodes Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayEpisodes.map((ep) => (
                  <div
                    key={ep.id || `ep-${ep.number}`}
                    className="group flex flex-col justify-between p-3.5 rounded-2xl bg-[#14121B] border border-white/[0.08] hover:border-blue-500/40 transition-all hover:bg-[#181522]"
                  >
                    <div className="flex gap-3">
                      <div 
                        className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 cursor-pointer bg-black/60"
                        onClick={() => onPlayEpisode(show, ep.number)}
                      >
                        {ep.thumbnailUrl || ep.thumbnail ? (
                          <img 
                            src={ep.thumbnailUrl || ep.thumbnail} 
                            alt={ep.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#0d2836] flex items-center justify-center text-[10px] text-[#7dd3fc] font-bold">
                            EP {ep.number}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100">
                          <Play className="w-6 h-6 fill-white text-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-mono-code font-bold text-white">
                          {ep.duration || '24m'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-rose-400 font-bold">
                          <span>EP {ep.number}</span>
                          <span>•</span>
                          <span className="text-amber-300">★ {ep.rating || 9.2}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                          {ep.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {ep.synopsis || `Official episode ${ep.number} of ${show.title}`}
                        </p>
                      </div>
                    </div>

                    {/* Key sakuga highlight moments */}
                    {ep.keyTimestamps && ep.keyTimestamps.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        <span className="text-blue-400 font-mono-code font-bold shrink-0">Highlights:</span>
                        {ep.keyTimestamps.map((ts: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => onPlayEpisode(show, ep.number)}
                            className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-rose-950 text-slate-300 hover:text-rose-300 shrink-0 font-mono-code transition-colors"
                          >
                            ⏱ {ts.time} - {ts.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: CHARACTERS & LORE */}
          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {show.characters.map((char) => (
                  <div 
                    key={char.id}
                    className="p-4 rounded-2xl bg-[#14121B] border border-white/[0.08] flex gap-4"
                  >
                    <img 
                      src={char.avatarUrl} 
                      alt={char.name} 
                      className="w-20 h-24 rounded-xl object-cover border border-white/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white font-display">
                          {char.name}
                        </h4>
                        <span className="text-[10px] font-mono-code text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                          {char.role}
                        </span>
                      </div>
                      
                      <div className="text-[11px] font-mono-code text-slate-400">
                        <span>EN: {char.voiceActorEn}</span> | <span className="text-blue-300">JP: {char.voiceActorJp}</span>
                      </div>

                      <blockquote className="text-xs italic text-rose-300/90 font-serif border-l-2 border-rose-500 pl-2">
                        {char.quote}
                      </blockquote>

                      {/* Power Stats Bar */}
                      <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-mono-code">
                        <div>
                          <div className="flex justify-between text-slate-400">
                            <span>Combat</span>
                            <span className="text-white font-bold">{char.powerStats.combat}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full mt-0.5">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${char.powerStats.combat}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-slate-400">
                            <span>Intelligence</span>
                            <span className="text-white font-bold">{char.powerStats.intelligence}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full mt-0.5">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${char.powerStats.intelligence}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Studio & Director Lore Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-blue-950/40 border border-rose-800/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider font-mono-code">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Director & Production Master Notes</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {show.loreSummary}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono-code text-slate-400">
                  <div>Director: <span className="text-white font-bold">{show.director}</span></div>
                  <div>Art Director: <span className="text-white font-bold">{show.artDirector}</span></div>
                  <div>Score: <span className="text-white font-bold">{show.musicComposer}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAKUGA & ANIMATION CRAFT */}
          {activeTab === 'sakuga' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#14121B] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-display">
                    Key Sakuga Cuts & Animation Breakdown
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  XTwo Shows curates individual keyframe cuts from legendary Japanese and international animators who push drawing, perspective, and lighting past human limits.
                </p>

                <div className="space-y-3 pt-2">
                  {show.sakugaClips.map((clip) => (
                    <div 
                      key={clip.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-300">{clip.sceneName}</span>
                          <span className="text-[10px] font-mono-code px-2 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                            {clip.frameRate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Lead Animator: <strong className="text-white">{clip.animator}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {clip.notes}
                        </p>
                      </div>

                      <button
                        onClick={() => onPlayEpisode(show, 1)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-900 to-blue-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
                      >
                        Inspect Cut
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORIGINAL SOUNDTRACK (OST) */}
          {activeTab === 'ost' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#14121B] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white font-display">
                      Original Orchestral Master & Vocal Tracks
                    </h4>
                  </div>
                  <span className="text-xs font-mono-code text-rose-400 font-bold">
                    FLAC Lossless Master
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {show.soundtracks.map((track) => {
                    const isCurrent = activeOstTrack === track.id;
                    return (
                      <div 
                        key={track.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                          isCurrent 
                            ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50' 
                            : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (isCurrent && isPlayingOst) {
                                setIsPlayingOst(false);
                              } else {
                                setActiveOstTrack(track.id);
                                setIsPlayingOst(true);
                              }
                            }}
                            className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-900 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0"
                          >
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </button>

                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{track.title}</span>
                              <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                                {track.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {track.artist} • {track.bpm} BPM • Key: {track.audioKey}
                            </div>
                          </div>
                        </div>

                        {/* Animated waveform bars if playing */}
                        <div className="flex items-center gap-3">
                          {isCurrent && isPlayingOst && (
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-4 bg-rose-500 animate-pulse" />
                              <span className="w-1 h-6 bg-blue-500 animate-bounce" />
                              <span className="w-1 h-3 bg-purple-500 animate-pulse" />
                              <span className="w-1 h-5 bg-rose-400 animate-bounce" />
                            </div>
                          )}
                          <span className="text-xs font-mono-code text-slate-400">{track.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAN REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Add a Review Form */}
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-[#14121B] border border-white/[0.08] space-y-3">
                <div className="text-xs font-bold text-white font-display flex items-center justify-between">
                  <span>Write a Sakuga Critique or Review</span>
                  <div className="flex items-center gap-1 text-amber-300">
                    <span>Score:</span>
                    <select
                      value={userReviewScore}
                      onChange={(e) => setUserReviewScore(Number(e.target.value))}
                      className="bg-black/60 text-amber-300 border border-amber-500/30 rounded px-2 py-0.5 text-xs font-bold"
                    >
                      <option value={10}>★ 10 / 10 Masterpiece</option>
                      <option value={9}>★ 9 / 10 Superb</option>
                      <option value={8}>★ 8 / 10 Great</option>
                      <option value={7}>★ 7 / 10 Good</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  placeholder="Share your thoughts on the fight choreography, sound design, character arcs, and art direction..."
                  className="w-full h-20 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-900 to-blue-700 text-white text-xs font-bold hover:scale-105 transition-transform"
                  >
                    Post Review
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#14121B] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={rev.avatar} 
                          alt={rev.author} 
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{rev.author}</div>
                          <div className="text-[10px] text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 text-xs font-bold">
                          ★ {rev.score} / 10
                        </span>
                        <span className="text-[10px] font-mono-code text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded">
                          {rev.tag}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rev.content}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <button className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{rev.likes} Likes</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Similar Recommended Titles Row */}
          {similarShows.length > 0 && (
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Because You Love {show.title}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similarShows.map((sim, index) => (
                  <div
                    key={`sim-${sim.id}-${index}`}
                    onClick={() => onSelectSimilarShow(sim)}
                    className="p-2.5 rounded-xl bg-[#14121B] hover:bg-rose-950/30 border border-white/[0.06] hover:border-rose-500/40 transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <img 
                      src={sim.heroPosterUrl} 
                      alt={sim.title} 
                      className="w-12 h-14 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{sim.title}</div>
                      <div className="text-[10px] text-rose-400 font-mono-code">{sim.studio}</div>
                      <div className="text-[10px] text-amber-300 mt-0.5">★ {sim.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
