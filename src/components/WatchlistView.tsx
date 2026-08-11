import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Search, 
  X, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter, 
  ChevronDown, 
  Calendar, 
  Flame, 
  Layers, 
  Tv, 
  Star, 
  Plus, 
  RotateCcw, 
  SlidersHorizontal, 
  Smile, 
  Film, 
  Check, 
  Info,
  Tag,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { WatchlistItem, WatchlistStatus, AspectRatioMode, Show } from '../types';
import { WATCHLIST_GENRES, WATCHLIST_YEAR_OPTIONS, YearFilterOption } from '../data/watchlistData';
import { TmdbImage } from './TmdbImage';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  aspectRatio: AspectRatioMode;
  onUpdateItemStatus: (id: string, newStatus: WatchlistStatus) => void;
  onUpdateEpisodesWatched: (id: string, delta: number) => void;
  onUpdateUserRating: (id: string, rating: number) => void;
  onRemoveFromWatchlist: (id: string) => void;
  onPlayShow: (item: WatchlistItem, episodeNumber?: number) => void;
  onOpenDetails: (item: WatchlistItem) => void;
  onQuickAddShow?: (show: Partial<WatchlistItem>) => void;
  onShowToast: (msg: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  aspectRatio,
  onUpdateItemStatus,
  onUpdateEpisodesWatched,
  onUpdateUserRating,
  onRemoveFromWatchlist,
  onPlayShow,
  onOpenDetails,
  onQuickAddShow,
  onShowToast
}) => {
  // 1. Search Query inside Watchlist
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Media Type Filter ('All' | 'Series' | 'Movies' | 'Anime')
  const [selectedMediaType, setSelectedMediaType] = useState<'All' | 'Series' | 'Movies' | 'Anime'>('All');

  // 3. Status Organization Filter ('All' | 'Watching' | 'Planned' | 'Finished' | 'Dropped')
  const [selectedStatus, setSelectedStatus] = useState<WatchlistStatus | 'All'>('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);

  // 4. Stackable Genre Filter (Multi-select array of genres)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState<boolean>(false);
  const [genreMatchMode, setGenreMatchMode] = useState<'any' | 'all'>('all');

  // 5. Stackable Year Time Filter (Multi-select array of year option IDs from 2026 back to 1980s)
  const [selectedYearIds, setSelectedYearIds] = useState<string[]>([]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);

  // 6. Sorting
  const [sortBy, setSortBy] = useState<'score' | 'progress' | 'recent' | 'title' | 'year'>('score');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);

  // 7. Active Card Status Dropdown tracker
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  // Helper to detect if an item is a Movie vs Series
  const isMovieItem = (item: WatchlistItem) => {
    return item.totalEpisodes === 1 || 
      item.title.toLowerCase().includes('movie') || 
      item.title.toLowerCase().includes('arc 2025') || 
      item.title.toLowerCase().includes('spirited away') || 
      item.title.toLowerCase().includes('infinity castle') || 
      (item.durationMinutes !== undefined && item.durationMinutes > 60) ||
      (item.genres || []).some(g => g.toLowerCase() === 'movie');
  };

  // Refs for click outside to close dropdowns
  const statusRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (statusRef.current && !statusRef.current.contains(target)) setIsStatusDropdownOpen(false);
      if (genreRef.current && !genreRef.current.contains(target)) setIsGenreDropdownOpen(false);
      if (yearRef.current && !yearRef.current.contains(target)) setIsYearDropdownOpen(false);
      if (sortRef.current && !sortRef.current.contains(target)) setIsSortDropdownOpen(false);
      if (openCardMenuId && !(target as HTMLElement).closest('.card-status-dropdown')) {
        setOpenCardMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCardMenuId]);

  // Stackable Genre Toggle
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      const exists = prev.includes(genre);
      const next = exists ? prev.filter(g => g !== genre) : [...prev, genre];
      onShowToast(exists ? `Removed genre: ${genre}` : `Added stackable genre: ${genre}`);
      return next;
    });
  };

  // Stackable Year Toggle
  const toggleYear = (yearId: string, label: string) => {
    setSelectedYearIds(prev => {
      const exists = prev.includes(yearId);
      const next = exists ? prev.filter(id => id !== yearId) : [...prev, yearId];
      onShowToast(exists ? `Removed year filter: ${label}` : `Added stackable year: ${label}`);
      return next;
    });
  };

  // Clear all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMediaType('All');
    setSelectedStatus('All');
    setSelectedGenres([]);
    setSelectedYearIds([]);
    setSortBy('score');
    onShowToast('Reset all watchlist filters');
  };

  // Metric summaries with live counters
  const stats = useMemo(() => {
    const total = watchlist.length;
    const watching = watchlist.filter(i => i.status === 'Watching').length;
    const planned = watchlist.filter(i => i.status === 'Planned').length;
    const finished = watchlist.filter(i => i.status === 'Finished').length;
    const dropped = watchlist.filter(i => i.status === 'Dropped').length;
    const moviesCount = watchlist.filter(isMovieItem).length;
    const seriesCount = watchlist.filter(i => !isMovieItem(i)).length;
    const animeCount = watchlist.length;
    const totalEpisodesWatched = watchlist.reduce((acc, i) => acc + (i.episodesWatched || 0), 0);
    const totalEpisodesCataloged = watchlist.reduce((acc, i) => acc + (i.totalEpisodes || 12), 0);
    const totalHoursWatched = Math.round((totalEpisodesWatched * 24) / 60);
    const avgScore = total > 0
      ? (watchlist.reduce((acc, i) => acc + (i.score || 9.0), 0) / total).toFixed(1)
      : '9.6';

    return { 
      total, 
      watching, 
      planned, 
      finished, 
      dropped, 
      moviesCount,
      seriesCount,
      animeCount,
      totalEpisodesWatched, 
      totalEpisodesCataloged,
      totalHoursWatched, 
      avgScore 
    };
  }, [watchlist]);

  // Real-time automated genre counters
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    WATCHLIST_GENRES.forEach(g => {
      counts[g] = watchlist.filter(item => 
        (item.genres || []).some(ig => ig.toLowerCase() === g.toLowerCase())
      ).length;
    });
    return counts;
  }, [watchlist]);

  // Real-time automated year filter counters
  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    WATCHLIST_YEAR_OPTIONS.forEach(opt => {
      counts[opt.id] = watchlist.filter(item => opt.match(item.releaseYear || 2024)).length;
    });
    return counts;
  }, [watchlist]);

  // Filter & Sort Pipeline
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter(item => {
      // 1. Media Type Filter (All | Series | Movies | Anime)
      if (selectedMediaType === 'Movies' && !isMovieItem(item)) {
        return false;
      }
      if (selectedMediaType === 'Series' && isMovieItem(item)) {
        return false;
      }

      // 2. Status Filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // 3. Stackable Genre Filter
      if (selectedGenres.length > 0) {
        const itemGenres = item.genres || [];
        if (genreMatchMode === 'all') {
          // Must match all selected genres (Intersection)
          const matchesAll = selectedGenres.every(sg => 
            itemGenres.some(ig => ig.toLowerCase() === sg.toLowerCase())
          );
          if (!matchesAll) return false;
        } else {
          // Matches any of the selected genres (Union)
          const matchesAny = selectedGenres.some(sg => 
            itemGenres.some(ig => ig.toLowerCase() === sg.toLowerCase())
          );
          if (!matchesAny) return false;
        }
      }

      // 4. Stackable Year Filter
      if (selectedYearIds.length > 0) {
        const itemYear = item.releaseYear || 2024;
        const matchesAnyYear = selectedYearIds.some(yearId => {
          const opt = WATCHLIST_YEAR_OPTIONS.find(o => o.id === yearId);
          return opt ? opt.match(itemYear) : false;
        });
        if (!matchesAnyYear) return false;
      }

      // 5. Live Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const jpTitleMatch = item.japaneseTitle?.toLowerCase().includes(q);
        const studioMatch = item.studio?.toLowerCase().includes(q);
        const synopsisMatch = item.synopsis?.toLowerCase().includes(q);
        const genreMatch = item.genres?.some(g => g.toLowerCase().includes(q));
        const statusMatch = item.status?.toLowerCase().includes(q);
        const notesMatch = item.notes?.toLowerCase().includes(q);

        if (!titleMatch && !jpTitleMatch && !studioMatch && !synopsisMatch && !genreMatch && !statusMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'progress') return (b.progressPercent || 0) - (a.progressPercent || 0);
      if (sortBy === 'year') return (b.releaseYear || 0) - (a.releaseYear || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0; // recent preserves array order
    });
  }, [watchlist, selectedMediaType, selectedStatus, selectedGenres, genreMatchMode, selectedYearIds, searchQuery, sortBy]);

  // Status Badge Colors & Labels
  const getStatusBadge = (status: WatchlistStatus) => {
    switch (status) {
      case 'Watching':
        return {
          bg: 'bg-[#14b8a6]',
          text: 'text-black',
          border: 'border-black',
          dot: 'bg-black',
          label: 'Watching'
        };
      case 'Planned':
        return {
          bg: 'bg-[#38bdf8]',
          text: 'text-black',
          border: 'border-black',
          dot: 'bg-black',
          label: 'Plan to Watch'
        };
      case 'Finished':
        return {
          bg: 'bg-[#a855f7]',
          text: 'text-white',
          border: 'border-black',
          dot: 'bg-white',
          label: 'Finished'
        };
      case 'Dropped':
        return {
          bg: 'bg-[#ef4444]',
          text: 'text-white',
          border: 'border-black',
          dot: 'bg-white',
          label: 'Dropped'
        };
    }
  };

  const isFiltered = selectedStatus !== 'All' || selectedGenres.length > 0 || selectedYearIds.length > 0 || searchQuery.trim() !== '';

  return (
    <div id="watchlist-view" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-cartoon animate-watchlist-pop">
      
      {/* =========================================================================
          TOP BANNER: CARTOON VAULT HERO WITH LIVE COUNTERS & QUICK STATS
          ========================================================================= */}
      <div className="relative rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 overflow-hidden">
        
        {/* Decorative Ambient Cyan Glow & Comic Grid Texture */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00f2fe]/20 via-[#14b8a6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#0284c7]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#14b8a6] to-[#00f2fe] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
                <Bookmark className="w-4 h-4 fill-black" />
              </div>
              <span className="px-3 py-0.5 rounded-full bg-[#14b8a6] text-black font-black text-[11px] uppercase tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                X2 TOON VAULT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0d2836] text-[#7dd3fc] font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000]">
                {stats.total} Shows Tracked
              </span>
              {filteredWatchlist.length !== stats.total && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#facc15] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000] animate-pulse">
                  ⚡ Cut Down To {filteredWatchlist.length} Matching
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>MY WATCHLIST</span>
              <span className="text-[#00f2fe] modern-cartoony-number">★</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#99f6e4] max-w-2xl font-bold leading-relaxed">
              Organize, calculate, and filter your animated masterpieces across <span className="text-white font-black">Watching ({stats.watching})</span>, <span className="text-white font-black">Planned ({stats.planned})</span>, <span className="text-white font-black">Finished ({stats.finished})</span>, and stackable genres with real-time automatic cut-down counters!
            </p>
          </div>

          {/* Quick Vault Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            
            {/* Watching */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Watching' ? 'All' : 'Watching')}
              className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2.5px_2.5px_0px_#000000] ${
                selectedStatus === 'Watching' 
                  ? 'bg-[#14b8a6] text-black shadow-[4px_4px_0px_#000000]' 
                  : 'bg-[#0d2836] text-white hover:bg-[#14b8a6]/20'
              }`}
            >
              <div className="text-[10px] font-black uppercase text-[#99f6e4] flex items-center justify-between">
                <span>Watching</span>
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
              </div>
              <div className="text-2xl font-black mt-0.5 modern-cartoony-number">{stats.watching}</div>
              <div className="text-[9px] font-bold text-[#7dd3fc]">In Progress</div>
            </div>

            {/* Planned */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Planned' ? 'All' : 'Planned')}
              className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2.5px_2.5px_0px_#000000] ${
                selectedStatus === 'Planned' 
                  ? 'bg-[#38bdf8] text-black shadow-[4px_4px_0px_#000000]' 
                  : 'bg-[#0d2836] text-white hover:bg-[#38bdf8]/20'
              }`}
            >
              <div className="text-[10px] font-black uppercase text-[#99f6e4] flex items-center justify-between">
                <span>Planned</span>
                <Clock className="w-3 h-3 text-[#38bdf8]" />
              </div>
              <div className="text-2xl font-black mt-0.5 modern-cartoony-number">{stats.planned}</div>
              <div className="text-[9px] font-bold text-[#7dd3fc]">Queue</div>
            </div>

            {/* Finished */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Finished' ? 'All' : 'Finished')}
              className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2.5px_2.5px_0px_#000000] ${
                selectedStatus === 'Finished' 
                  ? 'bg-[#a855f7] text-white shadow-[4px_4px_0px_#000000]' 
                  : 'bg-[#0d2836] text-white hover:bg-[#a855f7]/20'
              }`}
            >
              <div className="text-[10px] font-black uppercase text-[#99f6e4] flex items-center justify-between">
                <span>Finished</span>
                <CheckCircle2 className="w-3 h-3 text-[#c084fc]" />
              </div>
              <div className="text-2xl font-black mt-0.5 modern-cartoony-number">{stats.finished}</div>
              <div className="text-[9px] font-bold text-[#c084fc]">Completed</div>
            </div>

            {/* Dropped / Time */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Dropped' ? 'All' : 'Dropped')}
              className={`p-3 rounded-2xl border-2 border-black cursor-pointer transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shadow-[2.5px_2.5px_0px_#000000] ${
                selectedStatus === 'Dropped' 
                  ? 'bg-[#ef4444] text-white shadow-[4px_4px_0px_#000000]' 
                  : 'bg-[#0d2836] text-white hover:bg-[#ef4444]/20'
              }`}
            >
              <div className="text-[10px] font-black uppercase text-[#99f6e4] flex items-center justify-between">
                <span>Dropped</span>
                <RotateCcw className="w-3 h-3 text-[#f87171]" />
              </div>
              <div className="text-2xl font-black mt-0.5 modern-cartoony-number">{stats.dropped}</div>
              <div className="text-[9px] font-bold text-[#fca5a5]">~{stats.totalHoursWatched}h Streamed</div>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          MEDIA TYPE SELECTOR TABS: All Media | TV Series | Movies & Films | Anime
          Automatically calculates how many movies, series, and anime in total!
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-[#99f6e4] uppercase tracking-wider px-2 py-1">
            Media Format:
          </span>
          {[
            { id: 'All', label: 'All Formats', count: stats.total, icon: Film },
            { id: 'Series', label: 'TV Series', count: stats.seriesCount, icon: Tv },
            { id: 'Movies', label: 'Movies & Films', count: stats.moviesCount, icon: Film },
            { id: 'Anime', label: 'Anime & Toons', count: stats.animeCount, icon: Sparkles }
          ].map((tab) => {
            const isSelected = selectedMediaType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedMediaType(tab.id as any);
                  onShowToast(`Filtered by ${tab.label} (${tab.count} cartoons in watchlist)`);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-[#00f2fe] text-black border-black shadow-[2px_2px_0px_#000000] scale-105'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e] border-black/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black border border-black modern-cartoony-number ${
                  isSelected ? 'bg-black text-[#00f2fe]' : 'bg-black/60 text-[#7dd3fc]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-black text-[#7dd3fc] px-2 flex items-center gap-2">
          <span>Format Total: <strong className="text-white">{
            selectedMediaType === 'Movies' ? `${stats.moviesCount} Movies` :
            selectedMediaType === 'Series' ? `${stats.seriesCount} TV Series` :
            `${stats.total} Cartoons`
          }</strong></span>
        </div>
      </div>

      {/* =========================================================================
          QUICK GENRE CHIPS BAR WITH LIVE REAL-TIME COUNTER BADGES
          (Comedy, Romance, Action, Sci-Fi, Dark Fantasy, Supernatural, etc.)
          ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00f2fe]" />
            <span className="uppercase tracking-wider">Quick Genre Counters (Click to Stack & Cut Down):</span>
          </div>
          {selectedGenres.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#facc15] font-black">
                {selectedGenres.length} ACTIVE ({genreMatchMode === 'all' ? 'Match All' : 'Match Any'})
              </span>
              <button
                onClick={() => setSelectedGenres([])}
                className="text-[10px] text-[#f87171] hover:text-white underline cursor-pointer"
              >
                Clear Genres
              </button>
            </div>
          )}
        </div>

        {/* Scrollable / Wrap Genre Chips with Live Numbers */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { name: 'Comedy', emoji: '😄' },
            { name: 'Romance', emoji: '💖' },
            { name: 'Action', emoji: '⚔️' },
            { name: 'Sci-Fi', emoji: '🌌' },
            { name: 'Dark Fantasy', emoji: '🔮' },
            { name: 'Supernatural', emoji: '⚡' },
            { name: 'Adventure', emoji: '🗺️' },
            { name: 'Cyberpunk', emoji: '🏙️' },
            { name: 'Slice of Life', emoji: '☕' },
            { name: 'Thriller', emoji: '🎯' },
            { name: 'Historical', emoji: '⛩️' }
          ].map((genre) => {
            const isSelected = selectedGenres.includes(genre.name);
            const count = genreCounts[genre.name] || 0;
            return (
              <button
                key={genre.name}
                onClick={() => toggleGenre(genre.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-[#14b8a6] text-black border-black shadow-[2.5px_2.5px_0px_#000000] scale-105 ring-2 ring-[#00f2fe]'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e] border-black/40'
                }`}
                title={`Filter by ${genre.name} (${count} shows in vault)`}
              >
                <span>{genre.emoji}</span>
                <span>{genre.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black border border-black modern-cartoony-number ${
                  isSelected ? 'bg-black text-[#00f2fe]' : 'bg-black/60 text-[#7dd3fc]'
                }`}>
                  {count}
                </span>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          LIVE INTERSECTION & CUT-DOWN CALCULATOR BANNER
          (Shows exact calculation: e.g. "Cut down to 2 shows matching Comedy + Romance")
          ========================================================================= */}
      {selectedGenres.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2836] via-[#07151e] to-[#0d2836] border-[2.5px] border-[#00f2fe] shadow-[5px_5px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#facc15] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000]">
                🎯 LIVE CALCULATOR
              </span>
              <span className="text-white font-black text-sm">
                CUT DOWN TO <strong className="text-[#00f2fe] text-base modern-cartoony-number">{filteredWatchlist.length}</strong> OF {watchlist.length} SHOWS
              </span>
              <span className="text-[11px] text-[#99f6e4] font-bold">
                (Matching: {selectedGenres.join(' + ')})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#7dd3fc] font-bold flex-wrap">
              <span>Selected Criteria:</span>
              {selectedGenres.map(g => (
                <span key={g} className="px-2 py-0.5 rounded-md bg-[#14b8a6] text-black font-black text-[10px] border border-black">
                  {g} ({genreCounts[g] || 0} total)
                </span>
              ))}
              {selectedStatus !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-[#38bdf8] text-black font-black text-[10px] border border-black">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedMediaType !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-[#a855f7] text-white font-black text-[10px] border border-black">
                  Format: {selectedMediaType}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Match Mode Toggle: Intersection vs Union */}
            <div className="flex items-center bg-[#07151e] p-1 rounded-xl border border-black text-[10px] font-black">
              <button
                onClick={() => setGenreMatchMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  genreMatchMode === 'all'
                    ? 'bg-[#00f2fe] text-black border border-black shadow-[1px_1px_0px_#000000]'
                    : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="Match All (Intersection): Must contain ALL selected genres"
              >
                Match Both (⋂)
              </button>
              <button
                onClick={() => setGenreMatchMode('any')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  genreMatchMode === 'any'
                    ? 'bg-[#14b8a6] text-black border border-black shadow-[1px_1px_0px_#000000]'
                    : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="Match Any (Union): Contains EITHER of the selected genres"
              >
                Match Any (⋃)
              </button>
            </div>

            <button
              onClick={() => setSelectedGenres([])}
              className="px-3 py-1.5 rounded-xl bg-[#f87171] hover:bg-[#ef4444] text-white text-xs font-black border border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              Reset Genres
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE TOOLBAR:
          1. LIVE SEARCH BAR IN WATCHLIST
          2. STATUS ORGANIZE DROPDOWN MENU (Watching / Planned / Finished / Dropped)
          3. STACKABLE GENRE FILTER MENU & CHIPS (Action, Romance, etc.)
          4. STACKABLE YEAR TIME FILTER MENU & CHIPS (2026 back to 1980s)
          5. SORT DROPDOWN
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[6px_6px_0px_#000000] space-y-4">
        
        {/* Top Control Bar: Search Input + 4 Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* 1. DEDICATED SEARCH BAR IN WATCHLIST */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#00f2fe]" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your watchlist by title, studio, genre, notes..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#0d2836] text-white placeholder-[#5eead4]/60 text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] focus:outline-none focus:border-[#00f2fe] focus:shadow-[4px_4px_0px_#000000] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#99f6e4] hover:text-white cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Controls Cluster: Status Dropdown + Stackable Genre Dropdown + Stackable Year Dropdown + Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* 2. STATUS ORGANIZE DROPDOWN MENU */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsGenreDropdownOpen(false);
                  setIsYearDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${
                  selectedStatus !== 'All'
                    ? 'bg-[#14b8a6] text-black shadow-[3px_3px_0px_#000000]'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e]'
                }`}
                title="Organize by Watching, Planned, Finished, Dropped"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {selectedStatus === 'All' ? `Status: All (${stats.total})` : `Status: ${selectedStatus} (${
                    selectedStatus === 'Watching' ? stats.watching :
                    selectedStatus === 'Planned' ? stats.planned :
                    selectedStatus === 'Finished' ? stats.finished : stats.dropped
                  })`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-60 p-2 rounded-2xl bg-[#07151e] border-[2.5px] border-black shadow-[6px_6px_0px_#000000] z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black text-[#99f6e4] uppercase tracking-wider border-b border-black/50">
                    <span>Organize Watchlist</span>
                    <span className="text-[#00f2fe]">{stats.total} TOTAL</span>
                  </div>
                  
                  {[
                    { id: 'All', label: 'All Shows', count: stats.total, color: 'bg-[#00f2fe]' },
                    { id: 'Watching', label: 'Watching', count: stats.watching, color: 'bg-[#14b8a6]' },
                    { id: 'Planned', label: 'Plan to Watch', count: stats.planned, color: 'bg-[#38bdf8]' },
                    { id: 'Finished', label: 'Finished', count: stats.finished, color: 'bg-[#a855f7]' },
                    { id: 'Dropped', label: 'Dropped', count: stats.dropped, color: 'bg-[#ef4444]' }
                  ].map((item) => {
                    const isSelected = selectedStatus === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedStatus(item.id as any);
                          setIsStatusDropdownOpen(false);
                          onShowToast(`Filtered by ${item.label} (${item.count} shows)`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                          isSelected
                            ? 'bg-[#14b8a6] text-black border-black shadow-[2px_2px_0px_#000000]'
                            : 'text-[#ccfbf1] hover:text-white hover:bg-[#0d2836] border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full border border-black ${item.color}`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black text-[#00f2fe] border border-black modern-cartoony-number">
                            {item.count}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. STACKABLE GENRE DROPDOWN MENU */}
            <div className="relative" ref={genreRef}>
              <button
                onClick={() => {
                  setIsGenreDropdownOpen(!isGenreDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsYearDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${
                  selectedGenres.length > 0
                    ? 'bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white shadow-[3px_3px_0px_#000000]'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e]'
                }`}
                title="Stackable Genre Filters (Action, Romance, Supernatural, etc.)"
              >
                <Tag className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {selectedGenres.length === 0 
                    ? 'Genre: All' 
                    : `Genres (${selectedGenres.length})`}
                </span>
                {selectedGenres.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#00f2fe] text-black text-[9px] font-black flex items-center justify-center border border-black">
                    {selectedGenres.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGenreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 p-3 rounded-3xl bg-[#07151e] border-[2.5px] border-black shadow-[8px_8px_0px_#000000] z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b-2 border-black">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Stackable Genres
                      </span>
                    </div>
                    {selectedGenres.length > 0 && (
                      <button
                        onClick={() => setSelectedGenres([])}
                        className="text-[10px] font-black text-[#f87171] hover:text-white underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Mode Selector: Match Any vs Match All */}
                  <div className="flex items-center justify-between text-[11px] text-[#99f6e4] bg-[#0d2836] p-1.5 rounded-xl border border-black">
                    <span className="font-bold">Match Mode:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setGenreMatchMode('any')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                          genreMatchMode === 'any' ? 'bg-[#14b8a6] text-black border border-black' : 'text-[#7dd3fc]'
                        }`}
                      >
                        Match Any
                      </button>
                      <button
                        onClick={() => setGenreMatchMode('all')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                          genreMatchMode === 'all' ? 'bg-[#00f2fe] text-black border border-black' : 'text-[#7dd3fc]'
                        }`}
                      >
                        Match All
                      </button>
                    </div>
                  </div>

                  {/* Multi-Select Genre Tags Grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto no-scrollbar pt-1">
                    {WATCHLIST_GENRES.map((g) => {
                      const isSelected = selectedGenres.includes(g);
                      const count = genreCounts[g] || 0;
                      return (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                            isSelected
                              ? 'bg-[#14b8a6] text-black border-black shadow-[1.5px_1.5px_0px_#000000]'
                              : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e] border-black/40'
                          }`}
                        >
                          <span className="truncate">{g} ({count})</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                          ) : (
                            <Plus className="w-3 h-3 text-[#7dd3fc] opacity-60 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. STACKABLE YEAR TIME DROPDOWN MENU */}
            <div className="relative" ref={yearRef}>
              <button
                onClick={() => {
                  setIsYearDropdownOpen(!isYearDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsGenreDropdownOpen(false);
                  setIsSortDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${
                  selectedYearIds.length > 0
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-[3px_3px_0px_#000000]'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e]'
                }`}
                title="Stackable Year Filters (2026 back to 1980s)"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {selectedYearIds.length === 0 
                    ? 'Year: All' 
                    : `Years (${selectedYearIds.length})`}
                </span>
                {selectedYearIds.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#00f2fe] text-black text-[9px] font-black flex items-center justify-center border border-black">
                    {selectedYearIds.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 p-3 rounded-3xl bg-[#07151e] border-[2.5px] border-black shadow-[8px_8px_0px_#000000] z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b-2 border-black">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Stackable Release Years
                      </span>
                    </div>
                    {selectedYearIds.length > 0 && (
                      <button
                        onClick={() => setSelectedYearIds([])}
                        className="text-[10px] font-black text-[#f87171] hover:text-white underline cursor-pointer"
                      >
                        Clear Years
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar pt-1">
                    {WATCHLIST_YEAR_OPTIONS.map((y) => {
                      const isSelected = selectedYearIds.includes(y.id);
                      const count = yearCounts[y.id] || 0;
                      return (
                        <button
                          key={y.id}
                          onClick={() => toggleYear(y.id, y.label)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                            isSelected
                              ? 'bg-[#38bdf8] text-black border-black shadow-[2px_2px_0px_#000000]'
                              : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white hover:bg-[#14536e] border-black/40'
                          }`}
                        >
                          <span className="truncate">{y.label} ({count})</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#7dd3fc] opacity-60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 5. SORT DROPDOWN */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsGenreDropdownOpen(false);
                  setIsYearDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-black bg-[#0d2836] text-[#facc15] border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-[#14536e] transition-all cursor-pointer"
                title="Sort Watchlist"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap hidden sm:inline">Sort</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 p-2 rounded-2xl bg-[#07151e] border-[2.5px] border-black shadow-[6px_6px_0px_#000000] z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { id: 'score', label: '★ Highest Score' },
                    { id: 'progress', label: '📊 Watch Progress %' },
                    { id: 'recent', label: '🕒 Recently Added' },
                    { id: 'title', label: '🔤 Title (A - Z)' },
                    { id: 'year', label: '📅 Release Year' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id as any);
                        setIsSortDropdownOpen(false);
                        onShowToast(`Sorted watchlist by: ${s.label}`);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                        sortBy === s.id
                          ? 'bg-[#facc15] text-black border-black shadow-[2px_2px_0px_#000000]'
                          : 'text-[#ccfbf1] hover:text-white hover:bg-[#0d2836] border-transparent'
                      }`}
                    >
                      <span>{s.label}</span>
                      {sortBy === s.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset All Filters Button (if filtered) */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-2xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black text-xs font-black flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shrink-0"
                title="Reset all search, status, genre, and year filters"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Active Stackable Filters Pill Row */}
        {isFiltered && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-black/40 text-xs">
            <span className="text-[11px] font-black text-[#99f6e4] uppercase tracking-wider">Active Filters:</span>
            
            {/* Media Format Pill */}
            {selectedMediaType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00f2fe] text-black font-black text-[11px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                <span>Format: {selectedMediaType}</span>
                <button onClick={() => setSelectedMediaType('All')} className="hover:opacity-75">
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </span>
            )}

            {/* Status Pill */}
            {selectedStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#14b8a6] text-black font-black text-[11px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                <span>Status: {selectedStatus}</span>
                <button onClick={() => setSelectedStatus('All')} className="hover:opacity-75">
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </span>
            )}

            {/* Genre Pills */}
            {selectedGenres.map(g => (
              <span key={g} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0284c7] text-white font-black text-[11px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                <span>{g} ({genreCounts[g] || 0})</span>
                <button onClick={() => toggleGenre(g)} className="hover:opacity-75">
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </span>
            ))}

            {/* Year Pills */}
            {selectedYearIds.map(yearId => {
              const opt = WATCHLIST_YEAR_OPTIONS.find(o => o.id === yearId);
              return (
                <span key={yearId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#38bdf8] text-black font-black text-[11px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                  <span>{opt?.shortLabel || yearId}</span>
                  <button onClick={() => toggleYear(yearId, opt?.label || yearId)} className="hover:opacity-75">
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </span>
              );
            })}

            {/* Search Query Pill */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#facc15] text-black font-black text-[11px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:opacity-75">
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-black text-[#f87171] hover:text-white underline ml-auto cursor-pointer"
            >
              Clear All ({filteredWatchlist.length} matches)
            </button>
          </div>
        )}

      </div>

      {/* Live Results Bar with Automated Real-Time Counters */}
      <div className="flex items-center justify-between px-2 py-1 flex-wrap gap-2 text-xs font-black">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-[#14b8a6] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number text-[11px]">
            SHOWING {filteredWatchlist.length} OF {watchlist.length} CARTOONS
          </span>
          {selectedStatus !== 'All' && (
            <span className="px-2 py-0.5 rounded-md bg-[#07151e] text-[#00f2fe] border border-black shadow-[1px_1px_0px_#000000] text-[10px]">
              {selectedStatus.toUpperCase()}: {filteredWatchlist.length}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-[#07151e] text-[#facc15] border border-black shadow-[1px_1px_0px_#000000] text-[10px]">
              SEARCH: "{searchQuery}" ({filteredWatchlist.length} found)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[#99f6e4] text-[11px] font-bold">
          <span className="hidden sm:inline">
            Episodes: <strong className="text-white font-black">{stats.totalEpisodesWatched}</strong> / {stats.totalEpisodesCataloged}
          </span>
          <span className="hidden md:inline">
            • Streamed: <strong className="text-[#00f2fe] font-black">~{stats.totalHoursWatched}h</strong>
          </span>
          <span>
            • Rating: <strong className="text-[#facc15] font-black">★ {stats.avgScore}</strong>
          </span>
        </div>
      </div>

      {/* =========================================================================
          SHOWS GRID: WATCHLIST ITEMS WITH STATUS SELECTOR, EPISODE STEPPER, RATING
          ========================================================================= */}
      {filteredWatchlist.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[6px_6px_0px_#000000] space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#14b8a6]/20 border-2 border-black flex items-center justify-center mx-auto text-[#00f2fe] shadow-[3px_3px_0px_#000000]">
            <Smile className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">No Toons Match Your Filter</h3>
            <p className="text-xs text-[#99f6e4] font-bold max-w-sm mx-auto">
              No shows in your watchlist match your current search, status, genre, or year criteria.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          aspectRatio === '16:9'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {filteredWatchlist.map((item, idx) => {
            const badge = getStatusBadge(item.status);
            const isMenuOpen = openCardMenuId === item.id;

            return (
              <div
                key={`wl-${item.id}-${idx}`}
                className="group relative rounded-3xl overflow-hidden bg-[#07151e] border-[3px] border-black shadow-[5px_5px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                {/* Poster / Thumbnail Area with Strict TMDB Image & Resilient Fallback */}
                <div className={`relative w-full overflow-hidden bg-[#0d2836] border-b-2 border-black ${
                  aspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[2/3]'
                }`}>
                  <TmdbImage
                    
                    showId={item.showId || item.id}
                    id={item.showId || item.id}
                    posterPath={item.posterUrl}
                    backdropPath={item.backdropUrl}
                    type={aspectRatio === '16:9' ? 'backdrop' : 'poster'}
                    title={item.title}
                    name={item.japaneseTitle}
                    genres={item.genres}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Contrast Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07151e] via-[#07151e]/20 to-transparent" />

                  {/* Top Left: Interactive Status Switcher Dropdown on Card */}
                  <div className="absolute top-3 left-3 z-20 card-status-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCardMenuId(isMenuOpen ? null : item.id);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-transform hover:scale-105 cursor-pointer ${badge.bg} ${badge.text}`}
                      title="Change Show Status (Watching, Planned, Finished, Dropped)"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute left-0 mt-1 w-44 p-1.5 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] z-30 space-y-1 animate-in zoom-in-95 duration-100">
                        {(['Watching', 'Planned', 'Finished', 'Dropped'] as WatchlistStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateItemStatus(item.id, st);
                              setOpenCardMenuId(null);
                              onShowToast(`Moved "${item.title}" to ${st}`);
                            }}
                            className={`w-full text-left px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center justify-between transition-colors ${
                              item.status === st
                                ? 'bg-[#14b8a6] text-black'
                                : 'text-[#ccfbf1] hover:bg-[#0d2836] hover:text-white'
                            }`}
                          >
                            <span>{st}</span>
                            {item.status === st && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Right: Release Year & Remove Button */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-[#07151e] text-[#facc15] font-black text-[10px] border-2 border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
                      {item.releaseYear}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(item.id);
                        onShowToast(`Removed "${item.title}" from Watchlist`);
                      }}
                      className="p-1.5 rounded-xl bg-[#07151e] hover:bg-[#ef4444] text-[#99f6e4] hover:text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000] transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quality Badges */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#07151e]/90 text-[#00f2fe] font-black text-[9px] border border-black">
                      {item.qualityBadges?.[0] || '4K UHD'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#07151e]/90 text-white font-black text-[9px] border border-black modern-cartoony-number">
                      ★ {item.score || 9.5}
                    </span>
                  </div>

                  {/* Progress Bar at Bottom of Thumbnail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/80 backdrop-blur-sm overflow-hidden group-hover:h-2 transition-all duration-300">
                    <div
                      className="h-full bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] transition-all duration-700 ease-out relative"
                      style={{ width: `${item.progressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/80 blur-[3px]" />
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Card Content & Interactive Controls */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  
                  {/* Title & Studio & Synopsis */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#7dd3fc] font-black">
                      <span className="truncate">{item.studio || 'Animation Studio'}</span>
                      <span className="text-[#00f2fe] modern-cartoony-number">{item.progressPercent}% Watched</span>
                    </div>

                    <h3 
                      onClick={() => onOpenDetails(item)}
                      className="text-base font-black text-white line-clamp-1 group-hover:text-[#00f2fe] transition-colors cursor-pointer"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-[#99f6e4] line-clamp-2 leading-relaxed">
                      {item.synopsis}
                    </p>

                    {/* Stackable Genre Tags on Card */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {item.genres?.slice(0, 3).map((g) => (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black border transition-all cursor-pointer ${
                            selectedGenres.includes(g)
                              ? 'bg-[#14b8a6] text-black border-black'
                              : 'bg-[#0d2836] text-[#7dd3fc] border-black/50 hover:border-black hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Episode Watched Stepper Tracker */}
                  <div className="p-2.5 rounded-2xl bg-[#0d2836] border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-black">
                      <span className="text-white">Watched Progress</span>
                      <span className="text-[#00f2fe] modern-cartoony-number">
                        Ep {item.episodesWatched} / {item.totalEpisodes}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onUpdateEpisodesWatched(item.id, -1);
                            onShowToast(`Decreased watched progress for ${item.title}`);
                          }}
                          disabled={item.episodesWatched <= 0}
                          className="w-6 h-6 rounded-lg bg-[#07151e] hover:bg-[#14b8a6] hover:text-black text-white text-xs font-black border border-black flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all active:scale-95"
                          title="Previous Episode"
                        >
                          -
                        </button>

                        <button
                          onClick={() => {
                            onUpdateEpisodesWatched(item.id, 1);
                            onShowToast(`Marked Episode ${item.episodesWatched + 1} watched for ${item.title}`);
                          }}
                          disabled={item.episodesWatched >= item.totalEpisodes}
                          className="w-6 h-6 rounded-lg bg-[#14b8a6] hover:bg-[#00f2fe] text-black text-xs font-black border border-black flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all active:scale-95 shadow-[1px_1px_0px_#000000]"
                          title="Next Episode Watched"
                        >
                          +
                        </button>
                      </div>

                      {/* Interactive Rating Score */}
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
                        <span className="text-xs font-black text-[#facc15] modern-cartoony-number">
                          {item.userRating || 10}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Play + Details */}
                  <div className="pt-2 border-t-2 border-black/40 flex items-center gap-2">
                    <button
                      onClick={() => onPlayShow(item, item.episodesWatched + 1)}
                      className="flex-1 py-2 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#0284c7] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white hover:text-black text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[3.5px_3.5px_0px_#000000] transition-all transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.progressPercent === 100 ? 'Replay' : `Play Ep ${item.episodesWatched + 1 || 1}`}</span>
                    </button>

                    <button
                      onClick={() => onOpenDetails(item)}
                      className="px-3 py-2 rounded-2xl bg-[#0d2836] hover:bg-[#14536e] text-[#ccfbf1] hover:text-white text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                      title="Inspect Show Guide & Sakuga Highlights"
                    >
                      <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
