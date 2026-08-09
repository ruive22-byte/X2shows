import React, { useState, useEffect } from 'react';
import { 
  Film, Sparkles, Flame, Search, Bookmark, 
  Tv, Compass, Users, Bell, Volume2, VolumeX, 
  X, Check, SlidersHorizontal, Play, Eye
} from 'lucide-react';
import { Show } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAiCurator: () => void;
  onOpenWatchParty: () => void;
  soundFxEnabled: boolean;
  setSoundFxEnabled: (val: boolean) => void;
  watchlistCount: number;
  shows: Show[];
  onSelectShow: (show: Show) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenAiCurator,
  onOpenWatchParty,
  soundFxEnabled,
  setSoundFxEnabled,
  watchlistCount,
  shows,
  onSelectShow,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('navbar-search-input');
        searchInput?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchFilteredShows = searchQuery.trim()
    ? shows.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genres?.some(g => g?.toLowerCase()?.includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const navLinks = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'shows', label: 'All Shows', icon: Tv },
    { id: 'sakuga', label: 'Sakuga Vault', icon: Sparkles },
    { id: 'studios', label: 'Studios & Styles', icon: Compass },
    { id: 'watchlist', label: 'My Watchlist', icon: Bookmark, badge: watchlistCount },
  ];

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A090D]/95 backdrop-blur-xl border-b border-rose-950/40 shadow-2xl shadow-black/80 py-3' 
          : 'bg-gradient-to-b from-[#0A090D]/95 via-[#0A090D]/70 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Maroon & Electric Blue styling */}
        <div className="flex items-center gap-6">
          <button 
            id="nav-logo-btn"
            onClick={() => {
              setActiveTab('home');
              setSearchQuery('');
            }}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#800020] via-purple-950 to-[#2563EB] p-[2px] shadow-lg shadow-rose-950/50 group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0A090D] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {/* Glow bar inside logo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/30 via-transparent to-blue-600/30 opacity-70" />
                <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-blue-400 text-lg tracking-wider">
                  X2
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-300 to-white">
                  XTwo
                </span>
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-glow-blue">
                  SHOWS
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono-code uppercase tracking-widest text-rose-300/70 font-semibold">
                  Ultra Animation
                </span>
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-mono-code uppercase tracking-widest text-blue-400/80 font-bold">
                  4K HDR
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1 shadow-inner">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !searchQuery;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#800020] via-rose-900 to-[#1E3A8A] text-white shadow-md shadow-rose-950/60 font-bold border border-rose-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center/Right Section: Search, AI AniMatch, Watch Party, Sound FX, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Live Search Bar */}
          <div className="relative">
            <div className={`relative flex items-center rounded-full transition-all duration-300 ${
              isSearchFocused 
                ? 'w-48 sm:w-72 bg-[#14121A] border-rose-600/60 ring-2 ring-rose-500/20 shadow-lg shadow-rose-950/40' 
                : 'w-36 sm:w-56 bg-white/[0.05] border-white/[0.08] hover:border-white/20'
            } border px-3 py-1.5`}>
              <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${isSearchFocused ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search Sakuga, Studios..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400/80 focus:outline-none"
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block font-mono-code text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 leading-none">
                  /
                </kbd>
              )}
            </div>

            {/* Quick search dropdown */}
            {isSearchFocused && searchFilteredShows.length > 0 && (
              <div 
                className="absolute top-full right-0 sm:left-0 mt-2 w-72 sm:w-80 bg-[#121018] border border-rose-900/40 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-2xl"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="text-[10px] font-mono-code uppercase tracking-wider text-rose-300/70 px-2 py-1 flex items-center justify-between">
                  <span>Fast Suggestions</span>
                  <span className="text-blue-400">{searchFilteredShows.length} Matches</span>
                </div>
                <div className="space-y-1 mt-1">
                  {searchFilteredShows.map((show, idx) => (
                    <button
                      key={`search-sug-${show.id}-${idx}`}
                      onClick={() => {
                        onSelectShow(show);
                        setIsSearchFocused(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-950/40 transition-colors text-left group"
                    >
                      <img 
                        src={show.heroPosterUrl} 
                        alt={show.title} 
                        className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                          {show.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-rose-400">{show.studio}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">★ {show.score}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI AniMatch & Sakuga Curator Button */}
          <button
            id="nav-ai-curator-btn"
            onClick={onOpenAiCurator}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#800020] via-purple-900 to-[#2563EB] hover:from-rose-700 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105 border border-rose-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">AniMatch AI</span>
            <span className="sm:hidden font-mono-code text-[10px]">AI</span>
          </button>

          {/* Live Watch Party Button */}
          <button
            id="nav-watch-party-btn"
            onClick={onOpenWatchParty}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-200 text-xs font-semibold transition-all duration-200"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Watch Party</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Audio FX switch */}
          <button
            id="nav-sound-toggle-btn"
            onClick={() => setSoundFxEnabled(!soundFxEnabled)}
            title={soundFxEnabled ? "Mute Atmospheric Sound FX" : "Enable Atmospheric Sound FX"}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
          >
            {soundFxEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#121018] border border-rose-900/50 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Latest Premieres & Sakuga Drops
                  </span>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/30">
                    <div className="text-[11px] font-bold text-rose-300">Arcane: Hextech Legacy 4K Master</div>
                    <p className="text-[10px] text-slate-300 mt-0.5">Episode 6 with 120 FPS high dynamic range now available in Dolby Atmos.</p>
                    <span className="text-[9px] text-rose-400/80 font-mono-code mt-1 block">15m ago • Exclusive</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-800/30">
                    <div className="text-[11px] font-bold text-blue-300">Ufotable Infinity Castle OST</div>
                    <p className="text-[10px] text-slate-300 mt-0.5">Full orchestral FLAC audio tracks added to the sound vault.</p>
                    <span className="text-[9px] text-blue-400/80 font-mono-code mt-1 block">2h ago • New Track</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with VIP Pass */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
            <div className="relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#800020] via-rose-500 to-[#2563EB]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-[#800020] text-[8px] font-extrabold text-rose-200 border border-rose-400/40">
                PRO
              </span>
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/[0.05] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D0B12]/98 border-b border-rose-900/30 px-4 py-4 space-y-2 mt-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#800020] to-[#2563EB] text-white font-bold'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
            <button
              onClick={() => {
                onOpenAiCurator();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-900 to-blue-700 text-white text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              AniMatch AI
            </button>
            <button
              onClick={() => {
                onOpenWatchParty();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-950 border border-blue-500/30 text-blue-200 text-xs font-bold"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Watch Party
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
