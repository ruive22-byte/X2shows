import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  Tv, 
  Film, 
  Sparkles, 
  Flame, 
  Star, 
  Calendar, 
  ArrowUpDown, 
  Tag, 
  Layers, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  RotateCcw, 
  Play, 
  Bookmark, 
  Filter,
  Grid,
  List,
  Monitor,
  Maximize2,
  Tv2,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ArrowDownCircle,
  Infinity as InfinityIcon,
  Hash
} from 'lucide-react';
import { TmdbAnimatedShow } from '../data/tmdbData';
import { AspectRatioMode } from '../types';
import { TmdbImage } from './TmdbImage';

export type ShowFormat = 'TV' | 'Movie' | 'Special' | 'OVA' | 'ONA' | 'Music';
export type SortOption = 'Popularity' | 'Score' | 'Release Year' | 'Title' | 'Match %';
export type VaultAspectMode = '2:3' | '16:9' | '21:9' | '2.35:1';
export type CatalogViewMode = 'responsive-grid' | '3-rows-curated' | 'compact-list';

interface SearchResultsFilterViewProps {
  initialQuery?: string;
  catalog: TmdbAnimatedShow[];
  aspectRatio: AspectRatioMode;
  onOpenDetails: (show: TmdbAnimatedShow) => void;
  onPlayShow: (show: TmdbAnimatedShow) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: (showId: string) => boolean;
  onShowToast: (msg: string) => void;
  onBackToHome: () => void;
}

// Available standard genres
const ALL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Supernatural',
  'Thriller',
  'Family',
  'Crime'
];

// Available anime / cartoon specific tags
const ALL_TAGS = [
  'School',
  'Super Power',
  'Shounen',
  'Mecha',
  'Magic',
  'Martial Arts',
  'Psychological',
  'Space',
  'Ninja',
  'Cyberpunk',
  'Post-Apocalyptic',
  'Parody',
  'Isekai',
  'Dark Fantasy',
  'Time Travel',
  'Slice of Life',
  'Seinen',
  'Shojo',
  'Vampire',
  'Mythology',
  'Cyber Action',
  '120 FPS Sakuga'
];

// Years from vintage eras to 2026
const ALL_YEARS = [
  'All Years',
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2010s',
  '2000s',
  '1990s',
  '1980s',
  'Vintage (1970s & older)'
];

// Helper to determine format of a show
export function getShowFormat(show: TmdbAnimatedShow): ShowFormat {
  const title = (show.title || show.name || '').toLowerCase();
  const overview = (show.overview || '').toLowerCase();
  const studio = (show.studio || '').toLowerCase();
  const genres = (show.genres || []).map(g => g.toLowerCase());

  if (genres.includes('music') || title.includes('music') || title.includes('soundtrack')) {
    return 'Music';
  }
  if (genres.includes('special') || title.includes('special') || overview.includes('special episode')) {
    return 'Special';
  }
  if (genres.includes('ova') || title.includes('ova') || studio.includes('ova') || overview.includes('ova')) {
    return 'OVA';
  }
  if (genres.includes('ona') || title.includes('ona') || studio.includes('webtoon') || overview.includes('ona') || overview.includes('net animation')) {
    return 'ONA';
  }
  if (show.media_type === 'movie' || show.navType === 'Movies' || (show.durationMinutes && show.durationMinutes > 70 && show.totalEpisodes === 1)) {
    return 'Movie';
  }
  return 'TV';
}

// Helper to infer year from show
export function getShowYear(show: TmdbAnimatedShow): number {
  const dateStr = show.release_date || show.first_air_date;
  if (dateStr) {
    const y = parseInt(dateStr.split('-')[0], 10);
    if (!isNaN(y)) return y;
  }
  return 2024;
}

// Helper to infer tags for show
export function getShowTags(show: TmdbAnimatedShow): string[] {
  const tags: string[] = [];
  const text = `${show.title} ${show.name} ${show.overview} ${show.studio} ${show.tagline} ${(show.genres || []).join(' ')} ${(show.qualityBadges || []).join(' ')}`.toLowerCase();

  if (text?.includes('school') || text?.includes('academy') || text?.includes('high school') || text?.includes('class')) tags.push('School');
  if (text?.includes('super power') || text?.includes('powers') || text?.includes('superhero') || text?.includes('spider') || text?.includes('hero')) tags.push('Super Power');
  if (text?.includes('shounen') || text?.includes('shonen') || text?.includes('ninja') || text?.includes('naruto') || text?.includes('bleach') || text?.includes('dragon ball') || text?.includes('hunter')) tags.push('Shounen');
  if (text?.includes('mecha') || text?.includes('robot') || text?.includes('gundam') || text?.includes('machine')) tags.push('Mecha');
  if (text?.includes('magic') || text?.includes('wizard') || text?.includes('spell') || text?.includes('arcane') || text?.includes('witch')) tags.push('Magic');
  if (text?.includes('martial arts') || text?.includes('kung fu') || text?.includes('fighter') || text?.includes('combat') || text?.includes('punch')) tags.push('Martial Arts');
  if (text?.includes('psychological') || text?.includes('death note') || text?.includes('mind') || text?.includes('game') || text?.includes('paranoia')) tags.push('Psychological');
  if (text?.includes('space') || text?.includes('galaxy') || text?.includes('alien') || text?.includes('cowboy bebop') || text?.includes('planet')) tags.push('Space');
  if (text?.includes('supernatural') || text?.includes('spirit') || text?.includes('ghost') || text?.includes('demon') || text?.includes('monarch')) tags.push('Supernatural');
  if (text?.includes('ninja') || text?.includes('shinobi') || text?.includes('naruto')) tags.push('Ninja');
  if (text?.includes('cyberpunk') || text?.includes('cyber') || text?.includes('edgerunners') || text?.includes('futuristic') || text?.includes('neon')) tags.push('Cyberpunk');
  if (text?.includes('post-apocalyptic') || text?.includes('apocalypse') || text?.includes('wasteland') || text?.includes('akira') || text?.includes('titan')) tags.push('Post-Apocalyptic');
  if (text?.includes('isekai') || text?.includes('reincarnated') || text?.includes('another world')) tags.push('Isekai');
  if (text?.includes('dark fantasy') || text?.includes('berserk') || text?.includes('jujutsu') || text?.includes('slayer')) tags.push('Dark Fantasy');
  if (text?.includes('sakuga') || text?.includes('120') || text?.includes('4k') || text?.includes('mappa') || text?.includes('ufotable')) tags.push('120 FPS Sakuga');
  
  if (tags.length === 0) {
    tags.push('4K Sakuga', 'Must Watch');
  }
  return tags;
}

const FORMAT_OPTIONS: { id: ShowFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'TV', label: 'TV Series', icon: <Tv className="w-3.5 h-3.5" /> },
  { id: 'Movie', label: 'Movies', icon: <Film className="w-3.5 h-3.5" /> },
  { id: 'Special', label: 'Specials', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'OVA', label: 'OVA', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'ONA', label: 'ONA', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'Music', label: 'Music', icon: <Star className="w-3.5 h-3.5" /> }
];

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: 'Popularity', label: 'Popularity', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
  { id: 'Score', label: 'Top Score', icon: <Star className="w-3.5 h-3.5 text-yellow-400" /> },
  { id: 'Release Year', label: 'Release Year', icon: <Calendar className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'Title', label: 'Title (A-Z)', icon: <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" /> },
  { id: 'Match %', label: 'Match %', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> }
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];

export const SearchResultsFilterView: React.FC<SearchResultsFilterViewProps> = ({
  initialQuery = '',
  catalog,
  aspectRatio: globalAspectRatio,
  onOpenDetails,
  onPlayShow,
  onToggleWatchlist,
  isInWatchlist,
  onShowToast,
  onBackToHome
}) => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // Stackable Filter States
  const [selectedFormats, setSelectedFormats] = useState<ShowFormat[]>([]);
  const [selectedSort, setSelectedSort] = useState<SortOption>('Popularity');
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Layout & Density States
  // Default to 2:3 Classic Poster or 16:9 Wide ratio with responsive grid
  const [vaultAspect, setVaultAspect] = useState<VaultAspectMode>('2:3');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('responsive-grid');

  // Pagination State (Requested: currentPage default 1, itemsPerPage default 24)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Infinite Scrolling State & Sentinel
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = useState<boolean>(false);
  const [infiniteItemCount, setInfiniteItemCount] = useState<number>(24);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Droppable Menus Open States
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState<boolean>(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState<boolean>(false);

  // Dropdown Refs & Sentinel Ref
  const yearMenuRef = useRef<HTMLDivElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const genreMenuRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topGridRef = useRef<HTMLDivElement>(null);

  // Synchronize when initialQuery changes
  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteItemCount(itemsPerPage);
  }, [searchQuery, selectedFormats, selectedSort, selectedYear, selectedTags, selectedGenres, itemsPerPage]);

  // Click outside to close droppable dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (yearMenuRef.current && !yearMenuRef.current.contains(target)) {
        setIsYearDropdownOpen(false);
      }
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(target)) {
        setIsTagsDropdownOpen(false);
      }
      if (genreMenuRef.current && !genreMenuRef.current.contains(target)) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format toggler
  const handleToggleFormat = (fmt: ShowFormat) => {
    setSelectedFormats(prev => {
      const next = prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt];
      onShowToast(next?.includes(fmt) ? `Added format filter: ${fmt}` : `Removed format filter: ${fmt}`);
      return next;
    });
  };

  // Tag toggler
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      onShowToast(next?.includes(tag) ? `Added tag filter: #${tag}` : `Removed tag filter: #${tag}`);
      return next;
    });
  };

  // Genre toggler
  const handleToggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      const next = prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre];
      onShowToast(next?.includes(genre) ? `Added genre filter: ${genre}` : `Removed genre filter: ${genre}`);
      return next;
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFormats([]);
    setSelectedSort('Popularity');
    setSelectedYear('All Years');
    setSelectedTags([]);
    setSelectedGenres([]);
    setIsYearDropdownOpen(false);
    setIsTagsDropdownOpen(false);
    setIsGenreDropdownOpen(false);
    setCurrentPage(1);
    setInfiniteItemCount(itemsPerPage);
    onShowToast('Reset all filters to default view');
  };

  // Filtered & Sorted Shows Calculation
  const filteredAndSortedShows = useMemo(() => {
    let result = [...catalog];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/[^a-z0-9]/g, '');

      result = result.filter(show => {
        const title = (show.title || show.name || '').toLowerCase();
        const origTitle = (show.original_title || show.original_name || '').toLowerCase();
        const overview = (show.overview || '').toLowerCase();
        const studio = (show.studio || '').toLowerCase();
        const tagline = (show.tagline || '').toLowerCase();
        const genres = (show.genres || []).map(g => g.toLowerCase());
        const qualityBadges = (show.qualityBadges || []).map(b => b.toLowerCase());
        const tags = getShowTags(show).map(t => t.toLowerCase());

        return (
          title.includes(q) ||
          title.replace(/[^a-z0-9]/g, '').includes(cleanQ) ||
          origTitle.includes(q) ||
          overview.includes(q) ||
          studio.includes(q) ||
          tagline.includes(q) ||
          genres.some(g => g?.includes(q)) ||
          qualityBadges.some(b => b?.includes(q)) ||
          tags.some(t => t?.includes(q))
        );
      });
    }

    // 2. Format Filter (TV, Movie, Special, OVA, ONA, Music)
    if (selectedFormats.length > 0) {
      result = result.filter(show => {
        const fmt = getShowFormat(show);
        return selectedFormats.includes(fmt);
      });
    }

    // 3. Year Filter
    if (selectedYear !== 'All Years') {
      if (selectedYear === 'Vintage (1970s & older)') {
        result = result.filter(show => getShowYear(show) < 1980);
      } else if (selectedYear === '1980s') {
        result = result.filter(show => {
          const y = getShowYear(show);
          return y >= 1980 && y < 1990;
        });
      } else if (selectedYear === '1990s') {
        result = result.filter(show => {
          const y = getShowYear(show);
          return y >= 1990 && y < 2000;
        });
      } else if (selectedYear === '2000s') {
        result = result.filter(show => {
          const y = getShowYear(show);
          return y >= 2000 && y < 2010;
        });
      } else if (selectedYear === '2010s') {
        result = result.filter(show => {
          const y = getShowYear(show);
          return y >= 2010 && y < 2020;
        });
      } else {
        const targetY = parseInt(selectedYear, 10);
        result = result.filter(show => getShowYear(show) === targetY);
      }
    }

    // 4. Tags Filter (Stackable AND / OR match)
    if (selectedTags.length > 0) {
      result = result.filter(show => {
        const showTags = getShowTags(show);
        return selectedTags.some(t => showTags.includes(t));
      });
    }

    // 5. Genres Filter (Stackable)
    if (selectedGenres.length > 0) {
      result = result.filter(show => {
        const showGenres = show.genres || [];
        return selectedGenres.some(g => showGenres.includes(g));
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (selectedSort === 'Popularity') {
        return (b.vote_count || 1000) - (a.vote_count || 1000);
      }
      if (selectedSort === 'Score') {
        return (b.vote_average || 8.0) - (a.vote_average || 8.0);
      }
      if (selectedSort === 'Release Year') {
        return getShowYear(b) - getShowYear(a);
      }
      if (selectedSort === 'Title') {
        const aTitle = a.title || a.name || '';
        const bTitle = b.title || b.name || '';
        return aTitle.localeCompare(bTitle);
      }
      if (selectedSort === 'Match %') {
        return (b.matchScore || 95) - (a.matchScore || 95);
      }
      return 0;
    });

    return result;
  }, [catalog, searchQuery, selectedFormats, selectedYear, selectedTags, selectedGenres, selectedSort]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedFormats.length > 0 ||
    selectedYear !== 'All Years' ||
    selectedTags.length > 0 ||
    selectedGenres.length > 0
  );

  // Pagination Calculations
  const totalItems = filteredAndSortedShows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Sliced data based on mode (Standard Pagination vs Infinite Scroll)
  const displayedShows = useMemo(() => {
    if (isInfiniteScrollEnabled) {
      return filteredAndSortedShows.slice(0, infiniteItemCount);
    }
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedShows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedShows, safeCurrentPage, itemsPerPage, isInfiniteScrollEnabled, infiniteItemCount]);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(totalItems, isInfiniteScrollEnabled ? displayedShows.length : startIndex + itemsPerPage);

  // Curated 3 Rows calculation for the curated view mode
  const row1Items = useMemo(() => filteredAndSortedShows.slice(0, 12), [filteredAndSortedShows]);
  const row2Items = useMemo(() => filteredAndSortedShows.slice(12, 24), [filteredAndSortedShows]);
  const row3Items = useMemo(() => filteredAndSortedShows.slice(24, 36), [filteredAndSortedShows]);

  // Infinite Scroll Trigger (Fetching next batch of 24 items)
  const handleLoadMoreInfinite = useCallback(() => {
    if (isLoadingMore || infiniteItemCount >= totalItems) return;
    setIsLoadingMore(true);
    // Simulate brief network buffer load
    setTimeout(() => {
      setInfiniteItemCount(prev => Math.min(totalItems, prev + itemsPerPage));
      setIsLoadingMore(false);
      onShowToast(`Loaded next ${itemsPerPage} items into grid`);
    }, 350);
  }, [isLoadingMore, infiniteItemCount, totalItems, itemsPerPage, onShowToast]);

  // Intersection Observer for Sentinel element
  useEffect(() => {
    if (!isInfiniteScrollEnabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore && infiniteItemCount < totalItems) {
          handleLoadMoreInfinite();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isInfiniteScrollEnabled, isLoadingMore, infiniteItemCount, totalItems, handleLoadMoreInfinite]);

  // Page change handler with smooth scroll to grid top
  const handlePageChange = (newPage: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(target);
    onShowToast(`Navigated to Page ${target} of ${totalPages}`);
    if (topGridRef.current) {
      topGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Jump to page form submit
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      handlePageChange(parsed);
      setJumpPageInput('');
    } else {
      onShowToast(`Please enter a valid page between 1 and ${totalPages}`);
    }
  };

  // Aspect ratio class mapper for 2:3 classic poster, 16:9 wide, 21:9 ultrawide, 2.35:1
  const getAspectClass = (mode: VaultAspectMode) => {
    switch (mode) {
      case '2:3':
        return 'aspect-[2/3]';
      case '16:9':
        return 'aspect-video';
      case '21:9':
        return 'aspect-[21/9]';
      case '2.35:1':
        return 'aspect-[2.35/1]';
      default:
        return 'aspect-[2/3]';
    }
  };

  // Generate pagination buttons with smart ellipsis
  const renderPaginationButtons = () => {
    const pageButtons: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      pageButtons.push(1);
      if (safeCurrentPage > 3) {
        pageButtons.push('ellipsis-start');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pageButtons.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pageButtons.push('ellipsis-end');
      }
      pageButtons.push(totalPages);
    }

    return pageButtons.map((btn, idx) => {
      if (typeof btn === 'string') {
        return (
          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#7dd3fc] font-bold select-none">
            ...
          </span>
        );
      }

      const isCurrent = btn === safeCurrentPage;
      return (
        <button
          key={`page-num-${btn}`}
          onClick={() => handlePageChange(btn)}
          className={`min-w-[36px] h-9 px-2.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center ${
            isCurrent
              ? 'bg-[#00f2fe] text-black shadow-[2.5px_2.5px_0px_#000000] scale-105'
              : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/20 hover:text-white'
          }`}
          title={`Go to page ${btn}`}
        >
          {btn}
        </button>
      );
    });
  };

  // Render a Single Proportional Card in Auto-Responsive Grid (180px–220px+)
  const renderShowCard = (show: TmdbAnimatedShow, indexNumber: number) => {
    const showTitle = show.title || show.name || 'Animated Show';
    const showFmt = getShowFormat(show);
    const showYr = getShowYear(show);
    const inWl = isInWatchlist(show.id);
    const tags = getShowTags(show);
    const aspectClass = getAspectClass(vaultAspect);
    const isWideType = vaultAspect === '16:9' || vaultAspect === '21:9' || vaultAspect === '2.35:1';

    return (
      <div
        key={`${show.id}-${indexNumber}`}
        id={`catalog-card-${show.id}`}
        className="group relative flex flex-col rounded-2xl border-2 border-black bg-[#07151e] shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#00f2fe] hover:border-[#00f2fe] hover:-translate-y-1 transition-all overflow-hidden cursor-pointer select-none w-full font-cartoon"
        onClick={() => onOpenDetails(show)}
      >
        {/* Poster / Backdrop Image Container */}
        <div className={`relative w-full overflow-hidden bg-[#040a0f] ${aspectClass}`}>
          <TmdbImage
            
            tmdbId={show.tmdbId}
            posterPath={show.posterUrl || show.poster_path}
            backdropPath={show.backdropUrl || show.backdrop_path}
            type={isWideType ? 'backdrop' : 'poster'}
            title={showTitle}
            name={show.name}
            genres={show.genres}
            qualityBadge={show.qualityBadges?.[0] || '4K UHD'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Index Row Position Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none z-10">
            <span className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-[#00f2fe] font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000]">
              #{String(indexNumber).padStart(2, '0')}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none z-10">
            <span className="px-2 py-0.5 rounded-lg bg-[#facc15] text-black font-black text-[10px] border border-black shadow-[1px_1px_0px_#000000] flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>{show.vote_average?.toFixed(1) || '9.0'}</span>
            </span>
          </div>

          {/* Format Pill Bottom Left */}
          <div className="absolute bottom-2 left-2 pointer-events-none z-10">
            <span className="px-2 py-0.5 rounded-md bg-black/85 text-[#99f6e4] font-black text-[10px] border border-black uppercase tracking-wider">
              {showFmt}
            </span>
          </div>

          {/* Hover Overlay with Quick Action Buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2 z-20">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayShow(show);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Play 4K Sakuga Show"
              >
                <Play className="w-3 h-3 fill-black shrink-0" />
                <span>Play</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(show.id);
                }}
                className={`p-1.5 rounded-xl border border-black text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  inWl ? 'bg-[#facc15] text-black' : 'bg-black/90 text-white hover:bg-white/20'
                }`}
                title={inWl ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scaled Proportional Card Info & Typography */}
        <div className="p-3.5 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between bg-[#07151e]">
          <div className="space-y-1">
            <h4 className="card-title text-white group-hover:text-[#00f2fe] transition-colors leading-snug line-clamp-1" title={showTitle}>
              {showTitle}
            </h4>
            <div className="flex items-center justify-between text-xs text-[#7dd3fc] font-bold">
              <span>{showYr} • {show.studio ? show.studio.split('/')[0].trim() : 'Sakuga'}</span>
              <span className="text-[#14b8a6] font-black">{show.matchScore || 98}%</span>
            </div>
          </div>

          {/* Scaled Tag Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {tags.slice(0, 2).map(tag => (
              <span
                key={`tag-${show.id}-${tag}`}
                className="card-tag px-2 py-0.5 rounded-lg bg-[#0d2836] text-[#99f6e4] border border-black/80 truncate max-w-full"
              >
                #{tag}
              </span>
            ))}
            {show.qualityBadges?.[0] && (
              <span className="card-tag px-1.5 py-0.5 rounded-lg bg-[#14b8a6]/20 text-[#2dd4bf] border border-black/40 truncate">
                {show.qualityBadges[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="search-results-filter-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 animate-fadeIn font-cartoon">
      
      {/* 1. TOP COMMAND DECK / SEARCH VAULT HEADER */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] space-y-4">
        
        {/* Header Row: Title, Breadcrumb & Quick Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="px-3.5 py-2 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#99f6e4] font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
              title="Return to main home feed"
            >
              <span>← Back to Home</span>
            </button>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>MEDIA CATALOG & SEARCH VAULT</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00f2fe] text-black font-black text-xs border border-black shadow-[1px_1px_0px_#000000]">
                  {totalItems} TITLES
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-2xl bg-[#0d2836] hover:bg-rose-500 hover:text-white text-rose-300 font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center gap-1"
                title="Reset all search filters and queries"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* Aspect Ratio Selector (2:3 Classic Poster vs 16:9 Wide vs 21:9 Ultrawide) */}
            <div className="flex items-center rounded-2xl bg-[#0d2836] border-2 border-black p-0.5 shadow-[2px_2px_0px_#000000]">
              <button
                onClick={() => {
                  setVaultAspect('2:3');
                  onShowToast('Aspect: 2:3 Classic Poster Card');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  vaultAspect === '2:3' ? 'bg-[#00f2fe] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="2:3 Classic Poster"
              >
                <Film className="w-3.5 h-3.5" />
                <span>2:3 Poster</span>
              </button>

              <button
                onClick={() => {
                  setVaultAspect('16:9');
                  onShowToast('Aspect: 16:9 Wide Viewport');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  vaultAspect === '16:9' ? 'bg-[#00f2fe] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="16:9 Wide Viewport"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Wide</span>
              </button>

              <button
                onClick={() => {
                  setVaultAspect('21:9');
                  onShowToast('Aspect: 21:9 Ultrawide');
                }}
                className={`hidden sm:flex px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer items-center gap-1 ${
                  vaultAspect === '21:9' ? 'bg-[#00f2fe] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="21:9 Ultrawide Layout"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>21:9</span>
              </button>
            </div>

            {/* View Mode Selector: Auto-Responsive Grid vs 3 Curated Rows vs Compact List */}
            <div className="flex items-center rounded-2xl bg-[#0d2836] border-2 border-black p-0.5 shadow-[2px_2px_0px_#000000]">
              <button
                onClick={() => {
                  setViewMode('responsive-grid');
                  onShowToast('View: Auto-Responsive CSS Grid');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'responsive-grid' ? 'bg-[#14b8a6] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="Auto-Responsive CSS Grid (minmax 180px)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('3-rows-curated');
                  onShowToast('View: 3 Curated Thematic Rows');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === '3-rows-curated' ? 'bg-[#14b8a6] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="3 Curated Thematic Rows"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3 Rows</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('compact-list');
                  onShowToast('View: Compact List View');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'compact-list' ? 'bg-[#14b8a6] text-black shadow-[1px_1px_0px_#000000]' : 'text-[#7dd3fc] hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Bar + Format + Sort Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
          
          {/* Main Search Input */}
          <div className="lg:col-span-4 relative flex items-center w-full rounded-2xl border-2 border-black bg-[#0d2836] shadow-[3px_3px_0px_#000000] px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#00f2fe] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 4K anime, cartoons, studios, tags, characters..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-[#5eead4]/60 font-bold focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#99f6e4] hover:text-white rounded-full hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Format Filter Chips */}
          <div className="lg:col-span-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                setSelectedFormats([]);
                onShowToast('Format: All Formats');
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 ${
                selectedFormats.length === 0
                  ? 'bg-[#00f2fe] text-black shadow-[2.5px_2.5px_0px_#000000]'
                  : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/20'
              }`}
            >
              All Formats
            </button>

            {FORMAT_OPTIONS.map((fmt) => {
              const isSelected = selectedFormats.includes(fmt.id);
              return (
                <button
                  key={`fmt-${fmt.id}`}
                  onClick={() => handleToggleFormat(fmt.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black shadow-[2.5px_2.5px_0px_#000000]'
                      : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/20'
                  }`}
                >
                  <span className="shrink-0">{fmt.icon}</span>
                  <span>{fmt.label}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown Buttons */}
          <div className="lg:col-span-3 flex items-center gap-1.5 justify-end flex-wrap">
            <span className="text-[11px] font-black text-[#99f6e4] uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#facc15]" />
              Sort:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {SORT_OPTIONS.slice(0, 3).map((sort) => {
                const isSelected = selectedSort === sort.id;
                return (
                  <button
                    key={`sort-${sort.id}`}
                    onClick={() => {
                      setSelectedSort(sort.id);
                      onShowToast(`Sorted by: ${sort.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[1.5px_1.5px_0px_#000000] cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#facc15] text-black'
                        : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#facc15]/20'
                    }`}
                  >
                    {sort.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3 STACKABLE DROPPABLE MENUS (Year, Tags, Genres) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-black/60">
          
          {/* 1. DROPDOWN: YEAR */}
          <div ref={yearMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsYearDropdownOpen(prev => !prev);
                setIsTagsDropdownOpen(false);
                setIsGenreDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer ${
                selectedYear !== 'All Years'
                  ? 'bg-[#14b8a6] text-black'
                  : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/20'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="truncate">Year: {selectedYear}</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {ALL_YEARS.map(year => (
                  <button
                    key={`yr-opt-${year}`}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsYearDropdownOpen(false);
                      onShowToast(`Filtered by year: ${year}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-left transition-colors cursor-pointer ${
                      selectedYear === year
                        ? 'bg-[#00f2fe] text-black'
                        : 'text-[#ccfbf1] hover:bg-[#14b8a6]/20 hover:text-white'
                    }`}
                  >
                    <span>{year}</span>
                    {selectedYear === year && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. DROPDOWN: STACKABLE TAGS */}
          <div ref={tagsMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsTagsDropdownOpen(prev => !prev);
                setIsYearDropdownOpen(false);
                setIsGenreDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer ${
                selectedTags.length > 0
                  ? 'bg-[#00f2fe] text-black'
                  : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#00f2fe]/20'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {selectedTags.length > 0 ? `Tags (${selectedTags.length})` : 'Any Tags (Sakuga, Shounen...)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTagsDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-2xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] max-h-64 overflow-y-auto custom-scrollbar space-y-2 w-full sm:w-80">
                <div className="flex items-center justify-between pb-1.5 border-b border-black/60 text-[11px] text-[#99f6e4] font-black">
                  <span>SELECT STACKABLE TAGS</span>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-[#00f2fe] hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                  {ALL_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={`tag-opt-${tag}`}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black border border-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00f2fe] text-black shadow-[1.5px_1.5px_0px_#000000]'
                            : 'bg-[#0d2836] text-[#99f6e4] hover:bg-[#14b8a6]/30'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}#{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. DROPDOWN: STACKABLE GENRES */}
          <div ref={genreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsGenreDropdownOpen(prev => !prev);
                setIsYearDropdownOpen(false);
                setIsTagsDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer ${
                selectedGenres.length > 0
                  ? 'bg-[#facc15] text-black'
                  : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#facc15]/20'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {selectedGenres.length > 0 ? `Genres (${selectedGenres.length})` : 'Any Genre (Action, Sci-Fi...)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGenreDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-2xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] max-h-64 overflow-y-auto custom-scrollbar space-y-2 w-full sm:w-80">
                <div className="flex items-center justify-between pb-1.5 border-b border-black/60 text-[11px] text-[#99f6e4] font-black">
                  <span>SELECT STACKABLE GENRES</span>
                  {selectedGenres.length > 0 && (
                    <button
                      onClick={() => setSelectedGenres([])}
                      className="text-[#facc15] hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                  {ALL_GENRES.map(genre => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={`genre-opt-${genre}`}
                        onClick={() => handleToggleGenre(genre)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black border border-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#facc15] text-black shadow-[1.5px_1.5px_0px_#000000]'
                            : 'bg-[#0d2836] text-[#99f6e4] hover:bg-[#facc15]/30'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Active Stackable Filter Chips Bar */}
        {(selectedFormats.length > 0 || selectedYear !== 'All Years' || selectedTags.length > 0 || selectedGenres.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-black/60">
            <span className="text-xs text-[#7dd3fc] font-bold mr-1">Active:</span>

            {selectedFormats.map(fmt => (
              <span
                key={`chip-fmt-${fmt}`}
                onClick={() => handleToggleFormat(fmt)}
                className="px-2.5 py-1 rounded-full bg-[#14b8a6] text-black text-xs font-black border border-black flex items-center gap-1 cursor-pointer hover:bg-rose-400"
                title="Click to remove"
              >
                {fmt} ×
              </span>
            ))}

            {selectedYear !== 'All Years' && (
              <span
                onClick={() => setSelectedYear('All Years')}
                className="px-2.5 py-1 rounded-full bg-[#00f2fe] text-black text-xs font-black border border-black flex items-center gap-1 cursor-pointer hover:bg-rose-400"
                title="Click to remove"
              >
                Year: {selectedYear} ×
              </span>
            )}

            {selectedTags.map(tag => (
              <span
                key={`chip-tag-${tag}`}
                onClick={() => handleToggleTag(tag)}
                className="px-2.5 py-1 rounded-full bg-[#38bdf8] text-black text-xs font-black border border-black flex items-center gap-1 cursor-pointer hover:bg-rose-400"
                title="Click to remove"
              >
                #{tag} ×
              </span>
            ))}

            {selectedGenres.map(genre => (
              <span
                key={`chip-genre-${genre}`}
                onClick={() => handleToggleGenre(genre)}
                className="px-2.5 py-1 rounded-full bg-[#facc15] text-black text-xs font-black border border-black flex items-center gap-1 cursor-pointer hover:bg-rose-400"
                title="Click to remove"
              >
                {genre} ×
              </span>
            ))}
          </div>
        )}

      </div>

      {/* 2. DENSITY & PAGINATION STATUS BAR */}
      <div ref={topGridRef} className="flex items-center justify-between px-2 text-xs font-bold text-[#99f6e4] flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse" />
          <span>
            Showing <strong className="text-white font-black">{totalItems > 0 ? (isInfiniteScrollEnabled ? `1–${endIndex}` : `${startIndex + 1}–${endIndex}`) : 0}</strong> of <strong className="text-white font-black">{totalItems}</strong> Shows
          </span>
          <span className="text-[11px] text-[#7dd3fc] bg-[#0d2836] px-2.5 py-0.5 rounded-full border border-black">
            Auto-fill Responsive Grid • 180px–220px Cards
          </span>
        </div>

        {/* Mode Toggle: Sticky Pagination vs Infinite Scroll */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsInfiniteScrollEnabled(prev => !prev);
              onShowToast(!isInfiniteScrollEnabled ? 'Enabled Infinite Auto-Scroll with Observer Sentinel' : 'Switched to Classic Sticky Pagination');
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 ${
              isInfiniteScrollEnabled
                ? 'bg-[#00f2fe] text-black'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/20'
            }`}
            title="Toggle between standard page navigation and infinite scrolling"
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>{isInfiniteScrollEnabled ? 'Infinite Scroll Active' : 'Enable Infinite Scroll'}</span>
          </button>

          {/* Items Per Page Selector */}
          {!isInfiniteScrollEnabled && (
            <div className="flex items-center gap-1 bg-[#0d2836] p-0.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] text-[#7dd3fc] font-bold px-1.5">Per page:</span>
              {ITEMS_PER_PAGE_OPTIONS.map(num => (
                <button
                  key={`items-per-page-${num}`}
                  onClick={() => {
                    setItemsPerPage(num);
                    setCurrentPage(1);
                    onShowToast(`Displaying ${num} items per page`);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    itemsPerPage === num
                      ? 'bg-[#14b8a6] text-black shadow-[1px_1px_0px_#000000]'
                      : 'text-[#99f6e4] hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. SHOWS DISPLAY CONTAINER */}
      {totalItems === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center space-y-4 bg-[#07151e] rounded-3xl border-2 border-black shadow-[6px_6px_0px_#000000]">
          <div className="w-14 h-14 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mx-auto text-[#00f2fe] border-2 border-black shadow-[2px_2px_0px_#000000]">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white">No Shows Match Your Active Vault Filters</h3>
            <p className="text-xs sm:text-sm text-[#7dd3fc] max-w-md mx-auto leading-relaxed">
              Try unselecting some formats, removing specific tags or genres, or resetting filters to the full catalog.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-2xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000000] transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'responsive-grid' ? (
        /* ========================================================================= */
        /* MODE A: AUTO-RESPONSIVE CSS GRID (MINMAX 180PX, LIMIT ~6-8 ON DESKTOP)     */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="grid-container grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 sm:gap-6">
            {displayedShows.map((show, idx) => {
              const overallIdx = isInfiniteScrollEnabled ? idx + 1 : startIndex + idx + 1;
              return renderShowCard(show, overallIdx);
            })}
          </div>

          {/* Infinite Scroll Sentinel & Loading Animation */}
          {isInfiniteScrollEnabled && (
            <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-3">
              {isLoadingMore ? (
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] text-[#00f2fe] font-black text-xs animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00f2fe]" />
                  <span>Loading next {itemsPerPage} 4K Sakuga shows...</span>
                </div>
              ) : infiniteItemCount < totalItems ? (
                <button
                  onClick={handleLoadMoreInfinite}
                  className="px-5 py-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#99f6e4] font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000000] transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Load More Shows ({totalItems - infiniteItemCount} remaining)</span>
                </button>
              ) : (
                <div className="text-center py-4 text-xs font-bold text-[#7dd3fc]">
                  ✓ All {totalItems} titles loaded in catalog
                </div>
              )}
            </div>
          )}
        </div>
      ) : viewMode === '3-rows-curated' ? (
        /* ========================================================================= */
        /* MODE B: 3 DISTINCT CURATED THEMATIC ROWS                                 */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* ROW 1: TRENDING & TOP-RATED SAKUGA MASTERPIECES */}
          {row1Items.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xl bg-[#00f2fe] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000]">
                    ROW 1
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Trending & Top-Rated Sakuga</span>
                  </h3>
                </div>
                <span className="text-xs text-[#7dd3fc] font-bold">
                  {row1Items.length} items (01 - {row1Items.length})
                </span>
              </div>

              <div className="grid-container grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-5">
                {row1Items.map((show, idx) => renderShowCard(show, idx + 1))}
              </div>
            </div>
          )}

          {/* ROW 2: ACTION, SCI-FI & CYBERPUNK HITS */}
          {row2Items.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xl bg-[#14b8a6] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000]">
                    ROW 2
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00f2fe]" />
                    <span>Cyberpunk, Mecha & Shounen Masterworks</span>
                  </h3>
                </div>
                <span className="text-xs text-[#7dd3fc] font-bold">
                  {row2Items.length} items (13 - {12 + row2Items.length})
                </span>
              </div>

              <div className="grid-container grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-5">
                {row2Items.map((show, idx) => renderShowCard(show, 12 + idx + 1))}
              </div>
            </div>
          )}

          {/* ROW 3: FANTASY, SUPERNATURAL & VINTAGE VAULT */}
          {row3Items.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xl bg-[#facc15] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000]">
                    ROW 3
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Fantasy, Supernatural & Classic Masterworks</span>
                  </h3>
                </div>
                <span className="text-xs text-[#7dd3fc] font-bold">
                  {row3Items.length} items (25 - {24 + row3Items.length})
                </span>
              </div>

              <div className="grid-container grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-5">
                {row3Items.map((show, idx) => renderShowCard(show, 24 + idx + 1))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE C: COMPACT LIST VIEW                                                 */
        /* ========================================================================= */
        <div className="space-y-2.5">
          {displayedShows.map((show, idx) => {
            const showTitle = show.title || show.name || 'Animated Show';
            const showFmt = getShowFormat(show);
            const showYr = getShowYear(show);
            const inWl = isInWatchlist(show.id);
            const tags = getShowTags(show);
            const overallIdx = isInfiniteScrollEnabled ? idx + 1 : startIndex + idx + 1;

            return (
              <div
                key={`compact-${show.id}-${idx}`}
                onClick={() => onOpenDetails(show)}
                className="group flex items-center justify-between gap-3.5 p-3 rounded-2xl border-2 border-black bg-[#07151e] shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#00f2fe] hover:bg-[#0d2836] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-20 h-14 rounded-xl overflow-hidden border border-black bg-black shrink-0 relative aspect-[16/10]">
                    <TmdbImage
            
            tmdbId={show.tmdbId}
            posterPath={show.posterUrl || show.poster_path}
                      backdropPath={show.backdropUrl || show.backdrop_path}
                      type="backdrop"
                      title={showTitle}
                      name={show.name}
                      genres={show.genres}
                      qualityBadge={show.qualityBadges?.[0] || '4K UHD'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <span className="absolute bottom-0.5 left-0.5 px-1.5 py-0.2 rounded bg-black/80 text-[#00f2fe] text-[9px] font-black">
                      #{overallIdx}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white truncate group-hover:text-[#00f2fe]">
                        {showTitle}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-[#00f2fe] text-black text-[10px] font-black border border-black shrink-0">
                        {showFmt}
                      </span>
                    </div>
                    <p className="text-xs text-[#7dd3fc] truncate font-medium">
                      {showYr} • {show.studio || 'Sakuga Animation'} • {show.genres?.slice(0, 3).join(', ')}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tags.slice(0, 3).map(t => (
                        <span key={`compact-tag-${show.id}-${t}`} className="text-[10px] text-[#2dd4bf] font-bold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="px-2.5 py-1 rounded-xl bg-[#facc15] text-black font-black text-xs border border-black shadow-[1px_1px_0px_#000000]">
                    ★ {show.vote_average?.toFixed(1) || '9.0'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayShow(show);
                    }}
                    className="p-2.5 rounded-xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black border border-black shadow-[2px_2px_0px_#000000] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Stream show in 4K"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(show.id);
                    }}
                    className={`p-2.5 rounded-xl border border-black transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                      inWl ? 'bg-[#facc15] text-black' : 'bg-[#0d2836] text-white hover:bg-[#14b8a6]/30'
                    }`}
                    title={inWl ? 'In Watchlist' : 'Add to Watchlist'}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. STICKY OR BOTTOM-CENTERED PAGINATION NAVIGATION BAR */}
      {!isInfiniteScrollEnabled && totalPages > 1 && (
        <div className="sticky bottom-4 z-40 w-full max-w-4xl mx-auto pt-4">
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-[#07151e]/95 backdrop-blur-xl border-2 border-black shadow-[6px_6px_0px_#000000] flex-wrap">
            
            {/* Previous Button */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => handlePageChange(1)}
                className="p-2 rounded-xl bg-[#0d2836] disabled:opacity-30 text-[#99f6e4] hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                className="px-3.5 py-2 rounded-xl bg-[#0d2836] disabled:opacity-30 text-[#99f6e4] hover:text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
            </div>

            {/* Numeric Page Buttons & Current Page Indicator */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {renderPaginationButtons()}
            </div>

            {/* Next Button */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                className="px-3.5 py-2 rounded-xl bg-[#0d2836] disabled:opacity-30 text-[#99f6e4] hover:text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="p-2 rounded-xl bg-[#0d2836] disabled:opacity-30 text-[#99f6e4] hover:text-white border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Jump to Page Input Form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 w-full sm:w-auto justify-center pt-2 sm:pt-0 sm:border-l sm:border-black/60 sm:pl-3">
              <span className="text-xs text-[#7dd3fc] font-bold">Jump:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={`1-${totalPages}`}
                className="w-16 px-2 py-1 bg-[#0d2836] text-white text-xs font-black rounded-xl border border-black focus:outline-none focus:border-[#00f2fe] text-center"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-xl bg-[#14b8a6] hover:bg-[#00f2fe] text-black font-black text-xs border border-black shadow-[1px_1px_0px_#000000] cursor-pointer"
              >
                Go
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
