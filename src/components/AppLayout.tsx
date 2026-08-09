import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Film, 
  Flame, 
  Bookmark, 
  Search, 
  Play, 
  Info, 
  SlidersHorizontal, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Radio, 
  User, 
  Bell,
  Compass,
  Check,
  Zap,
  Smartphone,
  X
} from 'lucide-react';
import { SplashScreen } from './SplashScreen';

export interface AppLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeNav = 'home',
  onNavChange,
  searchQuery = '',
  onSearchChange,
}) => {
  const [showSplash, setShowSplash] = useState(true);
  const [internalActiveNav, setInternalActiveNav] = useState(activeNav);
  const [internalSearch, setInternalSearch] = useState(searchQuery);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      if (isMobile) {
        setLowPowerMode(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentNav = onNavChange ? activeNav : internalActiveNav;
  const currentSearch = onSearchChange ? searchQuery : internalSearch;

  const handleNavClick = (id: string) => {
    if (onNavChange) {
      onNavChange(id);
    } else {
      setInternalActiveNav(id);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const navItems = [
    { id: 'home', label: 'Spotlight', icon: Flame },
    { id: 'shows', label: 'Series', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'trending', label: 'Trending', icon: Compass },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-[#0A090D] text-slate-100 flex flex-col justify-between relative selection:bg-rose-900 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* 6-Second Mobile-Friendly Orchestrated Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} durationSeconds={6.0} />
        )}
      </AnimatePresence>

      {/* 1. Ambient Background Layer with Deep Obsidian, Maroon Red & Electric Blue Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Mobile Shader Bypass: Light CSS radial gradient on mobile / low-power mode */}
        {lowPowerMode ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(128,0,32,0.18)_0%,transparent_50%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.15)_0%,transparent_50%)]" />
        ) : (
          <>
            {/* Top Left Maroon Crimson Glow */}
            <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#800020]/20 blur-[140px]" />
            {/* Top Right Electric Blue Glow */}
            <div className="absolute top-10 -right-32 w-[500px] h-[500px] rounded-full bg-[#2563EB]/15 blur-[150px]" />
            {/* Mid Page Purple-Maroon Transition Wave */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-purple-950/15 blur-[160px]" />
          </>
        )}

        {/* Ambient Dark Obsidian Subtle Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* 2. Top Header & Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0A090D]/85 border-b border-white/[0.08] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Emblem */}
          <div className="flex items-center gap-6 sm:gap-8">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer focus:outline-none"
            >
              {/* Brand Glyph with Maroon to Electric Blue Gradient & Crimson Glow */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#800020] via-purple-950 to-[#2563EB] p-[1.5px] shadow-lg group-hover:shadow-[0_0_20px_rgba(128,0,32,0.6)] transition-all duration-300">
                <div className="w-full h-full bg-[#0D0D12] rounded-[10px] flex items-center justify-center">
                  <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-blue-400 text-xs sm:text-sm tracking-tighter">
                    X2
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-rose-200 transition-colors">
                    XTWO
                  </span>
                  <span className="font-display font-light text-lg sm:text-xl tracking-wider text-slate-400">
                    SHOWS
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[8px] sm:text-[9px] font-mono-code font-bold tracking-widest uppercase text-rose-300/80">
                    4K HDR CINEMA
                  </span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#14121B]/80 p-1 rounded-2xl border border-white/[0.06]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#800020] via-purple-900 to-[#2563EB] shadow-md border border-rose-400/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Area: Search + Specs + Low Power Toggle + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Search Input Field */}
            <div className="relative hidden sm:block w-40 lg:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search shows..."
                value={currentSearch}
                onChange={handleSearchInput}
                className="w-full bg-[#14121B] text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-8 py-2 border border-white/[0.08] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono-code font-bold text-slate-500 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
                ⌘K
              </span>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2 rounded-xl bg-[#14121B] border border-white/[0.08] text-slate-300 hover:text-white"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Low-Power 60 FPS Mode Toggle */}
            <button
              onClick={() => setLowPowerMode(!lowPowerMode)}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono-code font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                lowPowerMode 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                  : 'bg-[#14121B] border-white/[0.08] text-slate-300'
              }`}
              title="Toggle Low-Power 60 FPS Mobile Mode"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">{lowPowerMode ? '60 FPS Clean' : 'High FX'}</span>
            </button>

            {/* Audio Atmos Spec Toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-xl bg-[#14121B] border border-white/[0.08] text-slate-300 hover:text-white hover:border-[#800020]/60 transition-colors cursor-pointer"
              title={isAudioMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
              )}
            </button>

            {/* 4K HDR Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#800020]/20 border border-[#800020]/40 px-2.5 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-mono-code font-bold text-rose-300">
                ULTRA 4K HDR
              </span>
            </div>

            {/* Profile Avatar with Electric Blue Accent */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#800020] to-[#2563EB] p-[1.5px] cursor-pointer shadow-md hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0D0D12] rounded-[8px] sm:rounded-[9px] flex items-center justify-center text-slate-200 hover:text-white">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Search Popdown */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3 pt-1 border-t border-white/[0.06] bg-[#0A090D] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search animated shows, studios..."
                value={currentSearch}
                onChange={handleSearchInput}
                autoFocus
                className="w-full bg-[#14121B] text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-3 py-2 border border-white/[0.08] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* 3. Main Content Container */}
      <main className="flex-1 relative z-10 pb-20 md:pb-12">
        {children}
      </main>

      {/* 4. Mobile Bottom Navigation Bar (Fixed for phone screens < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A090D]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={`mobile-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#800020]/30 text-rose-300' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Ultra-Premium Deep Obsidian Footer */}
      <footer className="relative z-10 border-t border-[#800020]/40 bg-[#07060A] py-10 overflow-hidden hidden md:block">
        
        {/* Subtle Bottom Ambient Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 bg-gradient-to-r from-red-800 via-purple-900 to-blue-600 opacity-20 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
            
            {/* Brand in Footer */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#800020] to-[#2563EB] flex items-center justify-center font-display font-extrabold text-white text-xs">
                X2
              </div>
              <span className="font-display font-black text-lg text-white tracking-tight">
                XTWO SHOWS
              </span>
            </div>

            {/* Quick Navigation Items */}
            <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-400">
              <button onClick={() => handleNavClick('home')} className="hover:text-white transition-colors cursor-pointer">Spotlight</button>
              <button onClick={() => handleNavClick('shows')} className="hover:text-white transition-colors cursor-pointer">Series</button>
              <button onClick={() => handleNavClick('movies')} className="hover:text-white transition-colors cursor-pointer">Movies</button>
              <button onClick={() => handleNavClick('trending')} className="hover:text-white transition-colors cursor-pointer">Trending</button>
              <button onClick={() => handleNavClick('watchlist')} className="hover:text-white transition-colors cursor-pointer">Watchlist</button>
            </div>

          </div>

          {/* Copyright & Specs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono-code text-slate-500">
            <div>
              © 2026 XTwo Shows. Master-Engineered for High-Dynamic Dark Canvas Streaming.
            </div>
            <div className="flex items-center gap-3">
              <span>Deep Obsidian Canvas</span>
              <span>•</span>
              <span className="text-rose-400">Maroon Red #800020</span>
              <span>•</span>
              <span className="text-blue-400">Electric Blue #2563EB</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
