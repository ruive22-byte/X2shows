import React, { useState, useRef, useEffect } from 'react';
import { NavTab, AspectRatioMode, ShimmerSpeed, WatchlistItem } from '../types';
import { TmdbAnimatedShow, getTmdbPosterUrl } from '../data/tmdbData';
import { TmdbImage } from './TmdbImage';
import { exportCatalogToJson, exportCatalogToJpg, exportCatalogToPdf } from '../utils/exportCatalog';
import { 
  Search, 
  X, 
  Tv, 
  Film, 
  Sparkles, 
  Flame, 
  Bell, 
  SlidersHorizontal, 
  Grid, 
  LayoutGrid, 
  Check, 
  Smile,
  ShieldCheck,
  ChevronDown,
  Play,
  Bookmark,
  User,
  Download,
  FileText,
  Image as ImageIcon,
  FileCode,
  Volume2,
  Monitor,
  Palette
} from 'lucide-react';

interface HeaderNavProps {
  activeNav: NavTab;
  onSelectNav: (nav: NavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  aspectRatio: AspectRatioMode;
  onToggleAspectRatio: (ratio: AspectRatioMode) => void;
  shimmerSpeed: ShimmerSpeed;
  onChangeShimmerSpeed: (speed: ShimmerSpeed) => void;
  watchlistCount?: number;
  watchlist?: WatchlistItem[];
  catalog?: TmdbAnimatedShow[];
  navCounts?: Record<NavTab, number>;
  quickTagCounts?: Record<string, number>;
  totalCatalogCount?: number;
  matchingSearchCount?: number;
  onReplayIntro?: () => void;
  onOpenShowDetails?: (show: TmdbAnimatedShow) => void;
  onPlayShow?: (show: TmdbAnimatedShow) => void;
  onViewAllSearchResults?: (query: string) => void;
  onShowToast: (msg: string) => void;
}

const AVATAR_OPTIONS = [
  { id: 'ninja', label: 'Cyber Ninja', icon: '🥷', color: 'from-[#14b8a6] to-[#0284c7]' },
  { id: 'slayer', label: 'Demon Slayer', icon: '⚔️', color: 'from-[#f43f5e] to-[#fb7185]' },
  { id: 'mage', label: 'Sakuga Mage', icon: '🧙‍♂️', color: 'from-[#8b5cf6] to-[#38bdf8]' },
  { id: 'mecha', label: 'Mecha Pilot', icon: '🤖', color: 'from-[#00f2fe] to-[#14b8a6]' },
  { id: 'retro', label: 'Retro Toon', icon: '🎨', color: 'from-[#f59e0b] to-[#facc15]' },
  { id: 'neko', label: 'Kawaii Neko', icon: '🐱', color: 'from-[#ec4899] to-[#f472b6]' },
  { id: 'hero', label: 'Super Hero', icon: '🦸', color: 'from-[#3b82f6] to-[#60a5fa]' },
  { id: 'dragon', label: 'Dragon Knight', icon: '🐉', color: 'from-[#10b981] to-[#34d399]' },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeNav,
  onSelectNav,
  searchQuery,
  onSearchChange,
  aspectRatio,
  onToggleAspectRatio,
  shimmerSpeed,
  onChangeShimmerSpeed,
  watchlistCount = 0,
  watchlist = [],
  catalog = [],
  navCounts,
  quickTagCounts,
  totalCatalogCount = 28,
  matchingSearchCount,
  onReplayIntro,
  onOpenShowDetails,
  onPlayShow,
  onViewAllSearchResults,
  onShowToast
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  
  // User Selected Avatar from local storage
  const [currentAvatar, setCurrentAvatar] = useState<{ id: string; label: string; icon: string; color: string }>(() => {
    try {
      const saved = localStorage.getItem('x2shows_user_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.icon) return parsed;
      }
    } catch {}
    return AVATAR_OPTIONS[0];
  });

  const [activeProfileTab, setActiveProfileTab] = useState<'avatar' | 'settings' | 'export'>('avatar');
  const [audioPreset, setAudioPreset] = useState<'dolby' | 'spatial' | 'stereo'>('dolby');
  const [fpsPreset, setFpsPreset] = useState<'120' | '60' | 'auto'>('120');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Top navigation items with TV Shows, Movies, Anime, Toons, Trending & Watchlist
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge: number }[] = [
    { id: 'TV', label: 'TV Shows', icon: <Tv className="w-3.5 h-3.5" />, badge: navCounts?.['TV'] ?? 24 },
    { id: 'Movies', label: 'Movies', icon: <Film className="w-3.5 h-3.5" />, badge: navCounts?.['Movies'] ?? 16 },
    { id: 'Anime', label: 'Anime', icon: <Sparkles className="w-3.5 h-3.5" />, badge: navCounts?.['Anime'] ?? 20 },
    { id: 'Toons', label: 'Toons', icon: <Palette className="w-3.5 h-3.5" />, badge: navCounts?.['Toons'] ?? 18 },
    { id: 'Trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5" />, badge: navCounts?.['Trending'] ?? 12 },
    { id: 'Watchlist', label: 'Watchlist', icon: <Bookmark className="w-3.5 h-3.5" />, badge: watchlistCount }
  ];

  // Dedicated live search matching for the centered search pop-up modal (independent of the background)
  const modalMatchingShows = React.useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    const q = (modalSearchQuery || '').toLowerCase().trim();
    if (!q) {
      return catalog.slice(0, 10);
    }
    const cleanQ = q.replace(/[^a-z0-9]/g, '');

    const filtered = catalog.filter((show) => {
      const title = (show.title || show.name || '').toLowerCase();
      const cleanTitle = title.replace(/[^a-z0-9]/g, '');
      const origTitle = (show.original_title || show.original_name || '').toLowerCase();
      const cleanOrigTitle = origTitle.replace(/[^a-z0-9]/g, '');
      const overview = (show.overview || '').toLowerCase();
      const studio = (show.studio || '').toLowerCase();
      const tagline = (show.tagline || '').toLowerCase();
      const genres = (show.genres || []).map(g => g.toLowerCase());
      const chars = (show.characters || []).map(c => c.name.toLowerCase());
      const qualityBadges = (show.qualityBadges || []).map(b => b.toLowerCase());

      // Direct or clean alphanumeric match
      if (title.includes(q) || cleanTitle.includes(cleanQ)) return true;
      if (origTitle.includes(q) || cleanOrigTitle.includes(cleanQ)) return true;
      if (overview.includes(q) || studio.includes(q) || tagline.includes(q)) return true;
      if (genres.some(g => g?.includes(q) || g?.replace(/[^a-z0-9]/g, '')?.includes(cleanQ))) return true;
      if (chars.some(c => c?.includes(q))) return true;
      if (qualityBadges.some(b => b?.includes(q))) return true;

      // Word starts-with matching (e.g. typing "d" matches "Danny Phantom", "Death Note", "Demon Slayer", "Dragon Ball", "Dexter", "DuckTales", "Digimon", etc.)
      const words = `${title} ${origTitle}`.split(/\s+/);
      if (words.some(w => w.startsWith(q))) return true;

      // Typo tolerance (e.g. "narutoor" matches "naruto", "dannyphantom" matches "danny phantom")
      if (cleanQ.length > 2 && (cleanQ.startsWith(cleanTitle) || cleanTitle.startsWith(cleanQ))) return true;

      return false;
    });

    // Priority sort: exact starts-with title first, then matchScore
    return filtered.sort((a, b) => {
      const aTitle = (a.title || a.name || '').toLowerCase();
      const bTitle = (b.title || b.name || '').toLowerCase();
      const aStarts = aTitle.startsWith(q) || aTitle.replace(/[^a-z0-9]/g, '').startsWith(cleanQ);
      const bStarts = bTitle.startsWith(q) || bTitle.replace(/[^a-z0-9]/g, '').startsWith(cleanQ);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [catalog, modalSearchQuery]);

  const top10Matches = React.useMemo(() => modalMatchingShows.slice(0, 10), [modalMatchingShows]);

  const handleOpenSearchModal = () => {
    setModalSearchQuery(searchQuery || '');
    setIsSearchModalOpen(true);
  };

  const handleTriggerSeeAllResults = () => {
    setIsSearchModalOpen(false);
    const targetQuery = modalSearchQuery.trim();
    if (onViewAllSearchResults) {
      onViewAllSearchResults(targetQuery || 'all');
    } else {
      onSearchChange(targetQuery);
      onSelectNav('Home');
    }
    onShowToast(`Displaying all ${modalMatchingShows.length} results on Search Results page`);
  };

  // Close menus on outside click & keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => {
          if (!prev) {
            setModalSearchQuery(searchQuery || '');
          }
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsSettingsOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus modal input when search modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchModalOpen]);

  const handleSelectAvatar = (av: typeof AVATAR_OPTIONS[0]) => {
    setCurrentAvatar(av);
    try {
      localStorage.setItem('x2shows_user_avatar', JSON.stringify(av));
    } catch {}
    onShowToast(`Avatar updated: ${av.icon} ${av.label}`);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    modalInputRef.current?.focus();
    onShowToast('Search query cleared');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#07151e]/95 backdrop-blur-2xl border-b-2 border-black shadow-[0_4px_0px_#000000] transition-all duration-300 font-cartoon">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo & Top Navigation Tabs (Without Originals) */}
          <div className="flex items-center gap-4 lg:gap-7 shrink-0">
            <div 
              onClick={() => {
                onSelectNav('Home');
                onSearchChange('');
                onShowToast('Navigated to Home');
              }}
              className="logo group select-none cursor-pointer flex items-center gap-2"
              title="X2SHOWS Cartoon & Streaming Shell"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#14b8a6] via-[#0284c7] to-[#38bdf8] p-0.5 border-2 border-black shadow-[2.5px_2.5px_0px_#000000] transform group-hover:rotate-6 transition-transform">
                <div className="w-full h-full bg-[#07151e] rounded-[12px] flex items-center justify-center">
                  <span className="text-base font-black tracking-tight text-white bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent modern-cartoony-number">
                    X2
                  </span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-wide modern-cartoony-number">SHOWS</span>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-[#14b8a6] border border-black text-black shadow-[1px_1px_0px_#000000] hidden sm:inline-block">
                    TOON
                  </span>
                </div>
                <span className="text-[9px] text-[#7dd3fc] font-black tracking-wider uppercase">Teal & Blue</span>
              </div>
            </div>

            {/* Navigation Filter Toggles (Desktop Header Navigation) */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[#0d2836] px-2 py-1.5 rounded-2xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] shrink-0 whitespace-nowrap">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isActive) {
                        onSelectNav('Home');
                        onShowToast('Navigated to Home');
                      } else {
                        onSelectNav(item.id);
                        onShowToast(`Navigated to ${item.label}`);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer select-none border-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white shadow-[2px_2px_0px_#000000] border-black scale-105'
                        : 'text-[#99f6e4] hover:text-white hover:bg-white/[0.08] border-transparent hover:border-black'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-[#00f2fe] text-black border border-black shadow-[1px_1px_0px_#000000] modern-cartoony-number">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Centered Trigger Search Bar (Dynamically shorter when on search results page) */}
          <div className={`flex-1 mx-1 sm:mx-2 flex justify-center transition-all duration-300 ${
            searchQuery ? 'max-w-[130px] sm:max-w-[180px] md:max-w-[220px]' : 'max-w-xs sm:max-w-sm md:max-w-md'
          }`}>
            <div 
              onClick={handleOpenSearchModal}
              className={`glass-search relative flex items-center w-full h-9 sm:h-10 md:h-11 px-2.5 sm:px-3.5 rounded-full cursor-pointer hover:border-[#00f2fe] hover:shadow-[4px_4px_0px_#000000] transition-all group select-none border-2 border-black ${
                searchQuery ? 'bg-[#14b8a6]/20 border-[#00f2fe]' : 'bg-[#0d2836]'
              }`}
              title={searchQuery ? `Active Search: "${searchQuery}" (Click to expand)` : "Click to search cartoons (⌘K)"}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-[#38bdf8] group-hover:scale-110 transition-transform shrink-0" />
              
              <div className="w-full text-[11px] sm:text-xs md:text-sm text-[#5eead4]/80 font-bold truncate">
                {searchQuery ? (
                  <span className="text-white font-black truncate block">🔍 {searchQuery}</span>
                ) : (
                  <span className="truncate block">Search cartoons, For You, Top 10...</span>
                )}
              </div>

              {searchQuery ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearchChange('');
                    onShowToast('Search cleared ➔ Returned to full catalog');
                  }}
                  className="p-1 text-[#99f6e4] hover:text-white rounded-full hover:bg-white/10 transition-colors ml-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-black text-[#07151e] bg-[#38bdf8] border border-black rounded-full shadow-[1px_1px_0px_#000000]">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Right Side Utilities: Intro button, Profile Avatar with rich dropdown, Aspect Ratio */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Replay Cinematic Intro Screen Button */}
            <button
              onClick={() => {
                if (onReplayIntro) {
                  onReplayIntro();
                  onShowToast('Replaying 5-Second Cyber-Teal Cinematic Splash Intro...');
                }
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00f2fe] via-[#14b8a6] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00f2fe] border-2 border-black text-xs font-black text-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:shadow-[3.5px_3.5px_0px_#000000] transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] group shrink-0"
              title="Replay the 5-Second Cyber-Teal Cinematic Splash Intro"
            >
              <Play className="w-3.5 h-3.5 text-black fill-black transition-transform group-hover:scale-110 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">Intro</span>
              <span className="w-2 h-2 rounded-full bg-black animate-ping shrink-0 hidden sm:inline-block" />
            </button>

            {/* Profile Button with Dropdown Menu (Avatars, Settings, Export to JSON, JPG, PDF) */}
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-1.5 p-1 sm:p-1.5 pl-1.5 sm:pl-2 pr-2 sm:pr-3 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black cursor-pointer transition-all shadow-[2.5px_2.5px_0px_#000000] transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] ${
                  isProfileOpen ? 'bg-[#14b8a6] text-black shadow-[3px_3px_0px_#000000]' : ''
                }`}
                title="Profile, Avatars, Settings & Catalog Export"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#38bdf8] border border-black flex items-center justify-center text-sm shadow-sm">
                  <span>{currentAvatar.icon}</span>
                </div>
                <span className="text-[11px] font-black text-[#ccfbf1] group-hover:text-black hidden sm:inline-block">
                  Profile
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#99f6e4] group-hover:text-black" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-92 p-4 bg-[#07151e] border-[2.5px] border-black rounded-3xl shadow-[8px_8px_0px_#000000] z-50 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150 font-cartoon">
                  
                  {/* Profile Header */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#14b8a6] to-[#0284c7] border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000000]">
                        {currentAvatar.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black text-white">{currentAvatar.label}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-[#00f2fe] text-black font-black text-[9px] border border-black">
                            VIP
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7dd3fc] font-bold">120 FPS Sakuga Member</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="p-1 rounded-lg bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border border-black text-[#99f6e4] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dropdown Navigation Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0d2836] rounded-2xl border-2 border-black">
                    <button
                      onClick={() => setActiveProfileTab('avatar')}
                      className={`py-1 text-[11px] font-black rounded-xl transition-all ${
                        activeProfileTab === 'avatar' 
                          ? 'bg-[#14b8a6] text-black shadow-[1.5px_1.5px_0px_#000000]' 
                          : 'text-[#99f6e4] hover:text-white'
                      }`}
                    >
                      Icons
                    </button>
                    <button
                      onClick={() => setActiveProfileTab('settings')}
                      className={`py-1 text-[11px] font-black rounded-xl transition-all ${
                        activeProfileTab === 'settings' 
                          ? 'bg-[#14b8a6] text-black shadow-[1.5px_1.5px_0px_#000000]' 
                          : 'text-[#99f6e4] hover:text-white'
                      }`}
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => setActiveProfileTab('export')}
                      className={`py-1 text-[11px] font-black rounded-xl transition-all ${
                        activeProfileTab === 'export' 
                          ? 'bg-[#14b8a6] text-black shadow-[1.5px_1.5px_0px_#000000]' 
                          : 'text-[#99f6e4] hover:text-white'
                      }`}
                    >
                      Export
                    </button>
                  </div>

                  {/* TAB 1: Cartoon Avatar Icons Gallery */}
                  {activeProfileTab === 'avatar' && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-black text-[#99f6e4]">Choose Cartoon Avatar Icon:</span>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_OPTIONS.map((av) => (
                          <button
                            key={av.id}
                            onClick={() => handleSelectAvatar(av)}
                            className={`p-2 rounded-2xl border-2 border-black flex flex-col items-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 ${
                              currentAvatar.id === av.id
                                ? 'bg-gradient-to-tr from-[#14b8a6] to-[#0284c7] text-white'
                                : 'bg-[#0d2836] text-[#99f6e4] hover:bg-[#14b8a6]/30 hover:text-white'
                            }`}
                          >
                            <span className="text-xl">{av.icon}</span>
                            <span className="text-[9px] font-black truncate w-full text-center">{av.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Settings Controls */}
                  {activeProfileTab === 'settings' && (
                    <div className="space-y-3">
                      {/* Video Rate */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#7dd3fc] uppercase">Video & FPS Engine</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['120', '60', 'auto'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setFpsPreset(mode);
                                onShowToast(`Video Mode set to ${mode === 'auto' ? 'Auto Dynamic' : `${mode} FPS SAKUGA`}`);
                              }}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-black border border-black text-center ${
                                fpsPreset === mode
                                  ? 'bg-[#00f2fe] text-black shadow-[1.5px_1.5px_0px_#000000]'
                                  : 'bg-[#0d2836] text-[#99f6e4]'
                              }`}
                            >
                              {mode === '120' ? '120 FPS' : mode === '60' ? '60 FPS HDR' : 'Auto 4K'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Audio */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#7dd3fc] uppercase">Audio Fidelity</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['dolby', 'spatial', 'stereo'] as const).map((aud) => (
                            <button
                              key={aud}
                              onClick={() => {
                                setAudioPreset(aud);
                                onShowToast(`Audio set to ${aud.toUpperCase()}`);
                              }}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-black border border-black text-center capitalize ${
                                audioPreset === aud
                                  ? 'bg-[#14b8a6] text-black shadow-[1.5px_1.5px_0px_#000000]'
                                  : 'bg-[#0d2836] text-[#99f6e4]'
                              }`}
                            >
                              {aud}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shimmer Speed */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#7dd3fc] uppercase">Shimmer Animation</span>
                        <div className="grid grid-cols-4 gap-1">
                          {(['normal', 'fast', 'pulse', 'neon'] as ShimmerSpeed[]).map((spd) => (
                            <button
                              key={spd}
                              onClick={() => {
                                onChangeShimmerSpeed(spd);
                                onShowToast(`Shimmer preset: ${spd.toUpperCase()}`);
                              }}
                              className={`py-1 rounded-lg text-[9px] font-black border border-black text-center capitalize ${
                                shimmerSpeed === spd
                                  ? 'bg-[#38bdf8] text-black shadow-[1.5px_1.5px_0px_#000000]'
                                  : 'bg-[#0d2836] text-[#99f6e4]'
                              }`}
                            >
                              {spd}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Catalog Exporter (JSON, JPG, PDF) */}
                  {activeProfileTab === 'export' && (
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-black text-[#99f6e4]">Export Your Watchlist & Catalog:</span>
                      
                      <div className="space-y-2">
                        {/* JSON Export */}
                        <button
                          onClick={() => {
                            exportCatalogToJson(watchlist, catalog);
                            onShowToast('Exported catalog & watchlist to JSON file!');
                          }}
                          className="w-full p-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black flex items-center justify-between text-left transition-all shadow-[2px_2px_0px_#000000] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-[#00f2fe] text-black border border-black">
                              <FileCode className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-white group-hover:text-black">Export to JSON</div>
                              <div className="text-[9px] text-[#7dd3fc] group-hover:text-black/80 font-bold">Machine-readable backup of all shows</div>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-[#00f2fe] group-hover:text-black" />
                        </button>

                        {/* JPG Export */}
                        <button
                          onClick={() => {
                            exportCatalogToJpg(watchlist, catalog);
                            onShowToast('Generated and downloaded 4K Catalog JPG Poster!');
                          }}
                          className="w-full p-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black flex items-center justify-between text-left transition-all shadow-[2px_2px_0px_#000000] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-[#38bdf8] text-black border border-black">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-white group-hover:text-black">Export to JPG Poster</div>
                              <div className="text-[9px] text-[#7dd3fc] group-hover:text-black/80 font-bold">High-res canvas poster card graphic</div>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-[#38bdf8] group-hover:text-black" />
                        </button>

                        {/* PDF Export */}
                        <button
                          onClick={() => {
                            exportCatalogToPdf(watchlist, catalog);
                            onShowToast('Opened printable 4K PDF Catalog Report!');
                          }}
                          className="w-full p-2.5 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black flex items-center justify-between text-left transition-all shadow-[2px_2px_0px_#000000] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-[#14b8a6] text-black border border-black">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-white group-hover:text-black">Export to PDF Report</div>
                              <div className="text-[9px] text-[#7dd3fc] group-hover:text-black/80 font-bold">Printable document with tables & stats</div>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-[#14b8a6] group-hover:text-black" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Footer */}
                  <div className="pt-2 border-t-2 border-black flex justify-between items-center text-[10px] text-[#7dd3fc]">
                    <span className="font-bold">Watchlist: {watchlist.length} Shows</span>
                    <span className="text-[10px] font-black text-black bg-[#2dd4bf] px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000000]">
                      X2SHOWS v2.0
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* Aspect Ratio Toggle (2:3 Poster vs 16:9 Cinema) */}
            <button
              onClick={() => {
                const next = aspectRatio === '2:3' ? '16:9' : '2:3';
                onToggleAspectRatio(next);
                onShowToast(`Card Aspect Ratio set to ${next}`);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-xs font-black text-[#ccfbf1] transition-all cursor-pointer shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[3.5px_3.5px_0px_#000000] transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] shrink-0"
              title="Toggle Aspect Ratio (2:3 Poster vs 16:9 Cinema)"
            >
              {aspectRatio === '2:3' ? (
                <>
                  <Grid className="w-3.5 h-3.5 text-[#2dd4bf] group-hover:text-black" />
                  <span className="hidden md:inline text-[11px] font-black">2:3 Poster</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-[#38bdf8] group-hover:text-black" />
                  <span className="hidden md:inline text-[11px] font-black">16:9 Cinema</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar (Without Originals) */}
        <div className="lg:hidden flex items-center justify-start gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar border-t-2 border-black bg-[#07151e]">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isActive) {
                    onSelectNav('Home');
                    onShowToast('Navigated to Home');
                  } else {
                    onSelectNav(item.id);
                    onShowToast(`Navigated to ${item.label}`);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl shrink-0 transition-all border-2 border-black ${
                  isActive
                    ? 'bg-gradient-to-r from-[#14b8a6] to-[#0284c7] text-white shadow-[2px_2px_0px_#000000]'
                    : 'text-[#99f6e4] hover:text-white bg-[#0d2836]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-[#00f2fe] text-black border border-black shadow-[1px_1px_0px_#000000]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* =========================================================================
          CENTERED SEARCH SPOTLIGHT POP-UP MODAL WITH SOLID DARK BACKDROP (NO MOVING BG)
          ========================================================================= */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none font-cartoon bg-black/85 backdrop-blur-md"
          onClick={() => setIsSearchModalOpen(false)}
        >
          {/* Modal Container in Center */}
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#07151e] border-[3px] border-black rounded-3xl shadow-[10px_10px_0px_#000000] p-4 sm:p-6 z-10 space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header: Search Title, ESC shortcut & Close Button */}
            <div className="flex items-center justify-between gap-3 pb-1 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#14b8a6] to-[#38bdf8] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Search className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white tracking-wide">SEARCH CARTOONS</h3>
                  <p className="text-[10px] text-[#7dd3fc] font-bold">
                    {modalMatchingShows.length} Shows Found in Vault
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-[10px] font-black text-black bg-[#38bdf8] border border-black rounded-lg shadow-[1.5px_1.5px_0px_#000000]">
                  ESC
                </kbd>
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="p-1.5 rounded-full bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-[#99f6e4] transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                  title="Close search modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Big Prominent Center Search Input */}
            <div className="relative flex items-center bg-[#0d2836] border-2 border-black rounded-2xl p-2.5 px-4 shadow-[4px_4px_0px_#000000] focus-within:border-[#00f2fe] focus-within:shadow-[6px_6px_0px_#000000] transition-all">
              <Search className="w-5 h-5 text-[#00f2fe] mr-3 shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTriggerSeeAllResults();
                  }
                }}
                placeholder="Type letter (e.g. 'd') or show (naruto, danny phantom)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-[#5eead4]/60 font-black focus:outline-none"
              />
              {modalSearchQuery && (
                <button
                  onClick={() => setModalSearchQuery('')}
                  className="p-1.5 text-[#99f6e4] hover:text-white rounded-full hover:bg-white/10 transition-colors ml-2 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Matches Header */}
            <div className="flex items-center justify-between text-[11px] font-black text-[#7dd3fc]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
                <span>
                  {modalSearchQuery ? `TOP 10 SHOWS MATCHING "${modalSearchQuery.toUpperCase()}"` : 'TOP 10 CARTOONS (TYPE TO FILTER)'}
                </span>
              </span>
              <span className="text-[10px] text-[#2dd4bf] font-mono">
                {modalMatchingShows.length} TOTAL IN VAULT
              </span>
            </div>

            {/* Vertical Scrollable List of 10 Shows with Verified Distinct TmdbImage Posters */}
            <div className="flex-1 max-h-[46vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {top10Matches.length > 0 ? (
                top10Matches.map((show, idx) => {
                  const showTitle = show.title || show.name || 'Untitled Show';

                  return (
                    <div
                      key={show.id || idx}
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        if (onOpenShowDetails) {
                          onOpenShowDetails(show);
                        } else {
                          onShowToast(`Selected ${showTitle}`);
                        }
                      }}
                      className="group flex items-center justify-between p-2 sm:p-2.5 rounded-2xl border-2 border-black bg-[#0d2836] hover:bg-[#14b8a6]/20 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {/* Authentic TmdbImage Poster Thumbnail */}
                        <div className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl overflow-hidden border-2 border-black bg-[#07151e] shrink-0 relative shadow-[1.5px_1.5px_0px_#000000]">
                          <TmdbImage
                            posterPath={show.posterUrl || show.poster_path}
                            backdropPath={show.backdropUrl || show.backdrop_path}
                            type="poster"
                            title={showTitle}
                            name={show.name}
                            genres={show.genres}
                            qualityBadge={show.qualityBadges?.[0] || '4K UHD'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-black text-center text-[#00f2fe] py-0.5 pointer-events-none">
                            {show.matchScore ?? 98}%
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#2dd4bf] truncate">
                              {showTitle}
                            </h4>
                            <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-[#14b8a6] text-black border border-black shadow-[1px_1px_0px_#000000]">
                              {show.category || 'TV'}
                            </span>
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-[#7dd3fc] font-bold truncate mt-0.5">
                            {show.episodes ? `${show.episodes} Episodes` : (show as any).duration || 'Feature Film'} • {show.release_date?.split('-')[0] || '2024'} • {show.studio || 'Studio'}
                          </p>

                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {show.qualityBadges?.slice(0, 2).map((badge, bIdx) => (
                              <span key={bIdx} className="px-1.5 py-0.2 text-[8px] font-black rounded bg-black/60 text-[#38bdf8] border border-black/80">
                                {badge}
                              </span>
                            ))}
                            {show.genres?.slice(0, 2).map((g, gIdx) => (
                              <span key={gIdx} className="px-1.5 py-0.2 text-[8px] font-black rounded bg-[#07151e] text-[#99f6e4] border border-black/60 hidden sm:inline-block">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSearchModalOpen(false);
                            if (onPlayShow) {
                              onPlayShow(show);
                            } else if (onOpenShowDetails) {
                              onOpenShowDetails(show);
                            }
                            onShowToast(`Playing ${showTitle}`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black text-[11px] font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="Stream Now"
                        >
                          <Play className="w-3 h-3 fill-black text-black" />
                          <span className="hidden sm:inline">Play</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 px-4 text-center space-y-3 bg-[#0d2836]/60 rounded-2xl border-2 border-black">
                  <p className="text-sm font-black text-white">
                    No shows found matching "{modalSearchQuery}"
                  </p>
                  <p className="text-xs text-[#7dd3fc]">
                    Try searching for <span className="text-[#00f2fe] font-black cursor-pointer underline" onClick={() => setModalSearchQuery('Naruto')}>Naruto</span>, <span className="text-[#00f2fe] font-black cursor-pointer underline" onClick={() => setModalSearchQuery('Danny Phantom')}>Danny Phantom</span>, <span className="text-[#00f2fe] font-black cursor-pointer underline" onClick={() => setModalSearchQuery('Dragon Ball')}>Dragon Ball</span>, or letter <span className="text-[#00f2fe] font-black cursor-pointer underline" onClick={() => setModalSearchQuery('d')}>"d"</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar with "See More Results" Button */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-black text-xs gap-2">
              <div className="flex items-center gap-2 text-[11px] text-[#ccfbf1] font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                <span className="truncate">
                  Showing {top10Matches.length} of {modalMatchingShows.length} results
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {modalSearchQuery && (
                  <button
                    onClick={() => setModalSearchQuery('')}
                    className="px-3 py-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6]/20 border-2 border-black text-xs font-black text-[#99f6e4] transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    Clear
                  </button>
                )}
                
                {/* "See More Results" Button */}
                <button
                  onClick={handleTriggerSeeAllResults}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#38bdf8] text-black border-2 border-black text-xs font-black shadow-[2.5px_2.5px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:scale-105 transition-all cursor-pointer group"
                  title="View all matching results on dedicated search page (Enter)"
                >
                  <span>
                    See all {modalMatchingShows.length} results {modalSearchQuery ? `for "${modalSearchQuery}"` : ''} →
                  </span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-black bg-black text-white rounded border border-black">
                    ↵ Enter
                  </kbd>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
