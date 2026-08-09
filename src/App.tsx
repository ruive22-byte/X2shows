import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { CategoriesBar } from './components/CategoriesBar';
import { HeroBillboardSkeleton } from './components/HeroBillboardSkeleton';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { SkeletonRow } from './components/SkeletonRow';
import { SkeletonCard } from './components/SkeletonCard';
import { SkeletonDrawerModal } from './components/SkeletonDrawerModal';
import { WatchlistView } from './components/WatchlistView';
import { ShowDetailPage } from './components/ShowDetailPage';
import { WatchPage } from './components/WatchPage';
import { ShellControlsFloating } from './components/ShellControlsFloating';
import { ToastNotification } from './components/ToastNotification';
import { SplashScreen } from './components/SplashScreen';
import { DualApiStatusModal } from './components/DualApiStatusModal';
import { MovableVerticalTaskbar } from './components/MovableVerticalTaskbar';
import { GlobalShaderProvider } from './components/GlobalShaderProvider';
import { SearchResultsFilterView } from './components/SearchResultsFilterView';
import { useAntiInspect } from './hooks/useAntiInspect';
import { initAntiDebuggerTrap } from './utils/antiDebug';
import { INITIAL_SECTIONS, transformTmdbShowToSkeletonCard } from './data/skeletonData';
import { INITIAL_WATCHLIST } from './data/watchlistData';
import { INITIAL_CONTINUE_WATCHING, ContinueWatchingShow } from './data/continueWatchingData';
import { TMDB_ANIMATED_CATALOG, TmdbAnimatedShow } from './data/tmdbData';
import { catalogRegistry } from './services/catalog/catalogRegistry';
import { fetchAnimatedTvShows, fetchAnimatedMovies, deduplicateShows } from './services/tmdbApi';
import { CatalogSorter } from './utils/catalogSorter';
import { CatalogSanitizer } from './utils/catalogSanitizer';
import { 
  NavTab, 
  CategoryPill, 
  AspectRatioMode, 
  ShimmerSpeed, 
  SkeletonCardItem, 
  SkeletonSection,
  WatchlistItem,
  WatchlistStatus
} from './types';
import { Sparkles, Layers, Grid, SlidersHorizontal, RefreshCw, Smile, Zap, Loader2, ArrowDown, Search, X } from 'lucide-react';
import { AutoErrorCatcher } from './components/AutoErrorCatcher';
import { AiAgentMatrixModal } from './components/AiAgentMatrixModal';
import { CyberBugSwarm } from './components/CyberBugSwarm';
import { MascotCurator } from './components/MascotCurator';
import { useAutoHealthCheck } from './hooks/useAutoHealthCheck';
import { GeminiBugReporter } from './utils/geminiBugReporter';
import { SecuritySentinelBot } from './utils/securitySentinelBot';
import { PerformanceWarden } from './utils/performanceWarden';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';

const DeveloperDiagnosticsPanel = React.lazy(() =>
  import('./components/developer/DeveloperDiagnosticsPanel').then((m) => ({ default: m.DeveloperDiagnosticsPanel }))
);

export default function App() {

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.removeItem('x2shows_guest_user');
    
    // Check server session via API
    const verifySession = async () => {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user || { email: 'syle@x2shows.local', uid: 'server-authenticated-user' });
            setAuthLoading(false);
            return;
          }
        }
      } catch {}

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }, (error) => {
        console.warn('Firebase auth state error:', error);
        setUser(null);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    };

    verifySession();
  }, []);

  // Activate Anti-Inspect protection & Anti-Debugger trap
  useAntiInspect(true);

  useEffect(() => {
    // Start continuous 60 FPS stutter monitoring
    PerformanceWarden.init();

    const cleanup = initAntiDebuggerTrap(false); // set to false by default or true for anti-debug
    // Starts destroying ads/trackers the second the app loads
    SecuritySentinelBot.startDomDefender();
    return () => cleanup();
  }, []);

  const [sections, setSections] = useState<SkeletonSection[]>(INITIAL_SECTIONS);
  const [activeNav, setActiveNav] = useState<NavTab>('Home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryPill | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('2:3');
  const [shimmerSpeed, setShimmerSpeed] = useState<ShimmerSpeed>('normal');
  const [selectedCard, setSelectedCard] = useState<SkeletonCardItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDualApiModalOpen, setIsDualApiModalOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Keyboard shortcut Ctrl+Shift+D to open Developer Diagnostics Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDiagnosticsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // AI & Autonomy States
  const [isBugsVisible, setIsBugsVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x2_bugs_visible') !== 'false';
    } catch {
      return true;
    }
  });
  const [isMascotVisible, setIsMascotVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x2_mascot_visible') !== 'false';
    } catch {
      return true;
    }
  });
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);

  // Dedicated Show Detail Page State (Replaces popup modal when selecting a show)
  const [activeDetailShow, setActiveDetailShow] = useState<TmdbAnimatedShow | null>(null);

  // Dedicated Watch Page State (Third/Final Page layout for streaming)
  const [activeWatchShow, setActiveWatchShow] = useState<{ show: TmdbAnimatedShow; episodeNumber?: number } | null>(null);

  
  // HYDRATE CATALOG ON MOUNT
  useEffect(() => {
    let cancelled = false;
    const sanitized = CatalogSanitizer.sanitizeCatalog(TMDB_ANIMATED_CATALOG);
    catalogRegistry.init(sanitized).then(() => {
      if (!cancelled) setDynamicCatalog(CatalogSanitizer.sanitizeCatalog(catalogRegistry.getAll()));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrateCatalog() {
      try {
        const liveShows = await fetchAnimatedTvShows();
        const liveMovies = await fetchAnimatedMovies();
        let allShows = [];
        if (liveShows && Array.isArray(liveShows.shows)) allShows = [...allShows, ...liveShows.shows];
        if (liveMovies && Array.isArray(liveMovies.shows)) allShows = [...allShows, ...liveMovies.shows];
        
        allShows = CatalogSorter.deduplicateShows([], allShows);
        
        if (!cancelled && allShows.length > 0) {
          // Merge API shows with our hardcoded catalog to preserve added shows and priority
          const merged = CatalogSanitizer.sanitizeCatalog(CatalogSorter.deduplicateShows(catalogRegistry.getAll(), allShows));
          setDynamicCatalog(merged);
        }
      } catch (error) {
        console.warn(
          '[CATALOG] Live hydration failed, retaining static fallback:',
          error
        );
      }
    }
    hydrateCatalog();
    return () => {
      cancelled = true;
    };
  }, []);


  // Dynamic TMDB Pagination State & Infinite Scroll
  const [apiPage, setApiPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isAutoFetchEnabled, setIsAutoFetchEnabled] = useState<boolean>(false);
  const [dynamicCatalog, setDynamicCatalog] = useState<TmdbAnimatedShow[]>(catalogRegistry.getAll());
  const infiniteScrollRef = useRef<HTMLDivElement | null>(null);

  // Pre-filtered catalogs to prevent thread-blocking redundant iterations
  const moviesCatalog = useMemo(() => {
    return dynamicCatalog.filter(s => s.media_type === 'movie' || s.navType === 'Movies');
  }, [dynamicCatalog]);

  const animeCatalog = useMemo(() => {
    return dynamicCatalog.filter(s => s.navType === 'Anime' || s.genres?.includes('Anime'));
  }, [dynamicCatalog]);

  const toonsCatalog = useMemo(() => {
    return dynamicCatalog.filter(s => s.navType === 'Toons' || (s.media_type === 'tv' && s.navType !== 'Anime') || s.studio?.includes('Cartoon Network') || s.studio?.includes('Nickelodeon') || s.studio?.includes('Disney') || s.studio?.includes('Warner'));
  }, [dynamicCatalog]);

  const tvCatalog = useMemo(() => {
    return dynamicCatalog.filter(s => s.media_type === 'tv' || s.navType === 'TV' || s.navType === 'Toons' || s.navType === 'Anime');
  }, [dynamicCatalog]);

  const trendingCatalog = useMemo(() => {
    return dynamicCatalog.filter(s => (s.matchScore && s.matchScore >= 95) || (s.trendingRank && s.trendingRank <= 10) || s.vote_average >= 8.4);
  }, [dynamicCatalog]);

  // Watchlist State persisted in LocalStorage
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('x2shows_watchlist_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage', e);
    }
    return INITIAL_WATCHLIST;
  });

  // Continue Watching State persisted in LocalStorage
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingShow[]>(() => {
    try {
      const saved = localStorage.getItem('x2shows_continue_watching_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load continue watching from localStorage', e);
    }
    return INITIAL_CONTINUE_WATCHING;
  });

  // Save watchlist updates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('x2shows_watchlist_v2', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  // Save continue watching updates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('x2shows_continue_watching_v2', JSON.stringify(continueWatching));
    } catch (e) {
      console.warn('Failed to save continue watching to localStorage', e);
    }
  }, [continueWatching]);

  // Initialize Gemini Bug Reporter listeners on mount
  useEffect(() => {
    GeminiBugReporter.initGlobalErrorWatchers();
  }, []);

  // Automatic Health Check background monitoring every 5 minutes
  const { latestReport, hasCriticalIssues } = useAutoHealthCheck(dynamicCatalog, 5);


  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const handleToggleBugs = useCallback(() => {
    setIsBugsVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('x2_bugs_visible', String(next));
      } catch {}
      showToast(next ? 'Mini bugs active (12 patrolling nodes)' : 'Mini bugs hidden');
      return next;
    });
  }, [showToast]);

  const handleToggleMascot = useCallback(() => {
    setIsMascotVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('x2_mascot_visible', String(next));
      } catch {}
      showToast(next ? 'Cartoon Curator active (On-screen)' : 'Cartoon Curator hidden');
      return next;
    });
  }, [showToast]);

  const handleToggleMatrix = useCallback(() => {
    setIsMatrixOpen((prev) => !prev);
  }, []);

  /**
   * Dynamic TMDB Pagination Loader:
   * Fetches animated TV and Movies for the next page,
   * performs strict deduplication, and appends generously to For You, Cause You Like & Explore More.
   */
  const handleLoadMoreToons = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = apiPage + 1;

    try {
      // Fetch dynamic animated TV and Movies concurrently
      const [tvRes, movieRes] = await Promise.all([
        fetchAnimatedTvShows(nextPage),
        fetchAnimatedMovies(nextPage)
      ]);

      const incomingShows = [...tvRes.shows, ...movieRes.shows];

      // Exact required deduplication logic:
      const uniqueShows = CatalogSorter.deduplicateShows(dynamicCatalog, incomingShows);

      setDynamicCatalog(uniqueShows);
      setApiPage(nextPage);

      // Generously distribute new unique shows into For You, Cause You Like, Explore More, and Top 10
      setSections(prevSections => {
        return prevSections.map((sec, secIdx) => {
          // Distribute shows evenly and contextually across sections
          const matchingIncoming = incomingShows.filter((item, idx) => {
            if (sec.id === 'for-you') {
              return item.vote_average >= 7.8 || idx % 2 === 0;
            }
            if (sec.id === 'cause-you-like') {
              return item.genres?.some(g => ['Action', 'Fantasy', 'Sci-Fi', 'Adventure', 'Comedy'].includes(g)) || idx % 3 === 0;
            }
            if (sec.id === 'top-10') {
              return item.vote_average >= 8.2 || item.matchScore >= 95;
            }
            // explore-more gets all new discoveries
            return true;
          });

          const newCardItems: SkeletonCardItem[] = matchingIncoming.map(item => ({
            id: item.id,
            category: sec.title as CategoryPill,
            navType: item.navType,
            matchScore: item.matchScore || Math.round((item.vote_average || 8.5) * 10),
            durationMinutes: item.durationMinutes || 24,
            qualityBadges: item.qualityBadges || ['4K UHD', '120 FPS SAKUGA'],
            genreTags: item.genres || ['Animation', 'Action'],
            isFeatured: item.isFeatured,
            title: item.title,
            name: item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            overview: item.overview,
            vote_average: item.vote_average,
            studio: item.studio
          }));

          // Deduplicate cards inside section
          const combinedCards = [...sec.cards, ...newCardItems];
          const uniqueCardIds = Array.from(new Set(combinedCards.map(c => c.id)));
          const deduplicatedCards = uniqueCardIds.map(id => combinedCards.find(c => c.id === id)!);

          return {
            ...sec,
            cards: deduplicatedCards
          };
        });
      });

      showToast(`✨ Loaded +${incomingShows.length} Shows into For You, Cause You Like & Explore More!`);
    } catch (err) {
      console.warn('Failed to fetch dynamic TMDB page', err);
      showToast('Offline fallback: Loaded curated Sakuga collection page');
    } finally {
      setIsLoadingMore(false);
    }
  }, [apiPage, dynamicCatalog, isLoadingMore, showToast]);

  // Setup IntersectionObserver for smooth Infinite Scroll (Only triggers when isAutoFetchEnabled is ON)
  useEffect(() => {
    if (!isAutoFetchEnabled) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMoreToons();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    const currentEl = infiniteScrollRef.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [handleLoadMoreToons, isAutoFetchEnabled, isLoadingMore]);

  // Open Dedicated Show Detail Page (Transforms show card or id into full detail view)
  const handleOpenShowDetails = useCallback((cardOrShow: any) => {
    if (!cardOrShow) return;
    const rawId = cardOrShow.showId || cardOrShow.id;
    const rawTmdbId = cardOrShow.tmdbId || (typeof rawId === 'string' && rawId.startsWith('tmdb-') ? parseInt(rawId.split('-').pop() || '0') : 0);
    const rawTitle = (cardOrShow.title || cardOrShow.name || '').toLowerCase().trim();

    const matched = dynamicCatalog.find(s => 
      (rawId && s.id === rawId) || 
      (rawTmdbId > 0 && s.tmdbId === rawTmdbId) || 
      (rawTitle && (s.title || s.name || '').toLowerCase().trim() === rawTitle)
    ) || TMDB_ANIMATED_CATALOG.find(s => 
      (rawId && s.id === rawId) || 
      (rawTmdbId > 0 && s.tmdbId === rawTmdbId) || 
      (rawTitle && (s.title || s.name || '').toLowerCase().trim() === rawTitle)
    ) || catalogRegistry.getAll().find(s =>
      (rawId && s.id === rawId) || 
      (rawTmdbId > 0 && s.tmdbId === rawTmdbId) || 
      (rawTitle && (s.title || s.name || '').toLowerCase().trim() === rawTitle)
    );

    if (matched) {
      setActiveDetailShow(matched);
    } else {
      const posterPath = cardOrShow.poster_path || cardOrShow.posterPath;
      const rawPoster = cardOrShow.posterUrl || cardOrShow.resolvedPosterUrl;
      const posterUrl = rawPoster ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster}`) : (posterPath ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`) : undefined);

      const backdropPath = cardOrShow.backdrop_path || cardOrShow.backdropPath;
      const rawBackdrop = cardOrShow.backdropUrl || cardOrShow.resolvedBackdropUrl;
      const backdropUrl = rawBackdrop ? (rawBackdrop.startsWith('http') ? rawBackdrop : `https://image.tmdb.org/t/p/original${rawBackdrop}`) : (backdropPath ? (backdropPath.startsWith('http') ? backdropPath : `https://image.tmdb.org/t/p/original${backdropPath}`) : undefined);

      const isMovie = cardOrShow.navType === 'Movies' || cardOrShow.mediaType === 'movie' || cardOrShow.media_type === 'movie' || rawTitle.includes('spider-verse') || rawTitle.includes('movie');

      const synthesized: TmdbAnimatedShow = {
        id: rawId || `tmdb-movie-${rawTmdbId || 569094}`,
        tmdbId: rawTmdbId || 569094,
        title: cardOrShow.title || cardOrShow.name || 'Animated Masterpiece',
        name: cardOrShow.name || cardOrShow.title || 'Animated Masterpiece',
        poster_path: posterPath || (posterUrl ? posterUrl.replace('https://image.tmdb.org/t/p/w500', '') : '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'),
        posterUrl: posterUrl || 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        resolvedPosterUrl: posterUrl || 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop_path: backdropPath || (backdropUrl ? backdropUrl.replace('https://image.tmdb.org/t/p/original', '') : '/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg'),
        backdropUrl: backdropUrl || 'https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
        resolvedBackdropUrl: backdropUrl || 'https://image.tmdb.org/t/p/original/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg',
        overview: cardOrShow.overview || cardOrShow.synopsis || 'An extraordinary animated production rendered with dynamic frame rate shifts and rich world-building.',
        vote_average: cardOrShow.vote_average || cardOrShow.score || 9.2,
        vote_count: 3200,
        first_air_date: cardOrShow.release_date || cardOrShow.first_air_date || '2023-05-31',
        genres: cardOrShow.genreTags || cardOrShow.genres || ['Animation', 'Action', 'Sci-Fi'],
        genre_ids: [16, 10759],
        media_type: isMovie ? 'movie' : 'tv',
        navType: isMovie ? 'Movies' : 'TV',
        category: cardOrShow.category || 'For You',
        durationMinutes: cardOrShow.durationMinutes || (isMovie ? 140 : 24),
        totalEpisodes: cardOrShow.totalEpisodes || (isMovie ? 1 : 12),
        seasonCount: cardOrShow.seasonCount || 1,
        studio: cardOrShow.studio || 'Sony Pictures Animation',
        qualityBadges: ['4K UHD', '120 FPS SAKUGA', 'DOLBY ATMOS'],
        matchScore: cardOrShow.matchScore || 98,
        tagline: cardOrShow.tagline || 'Experience peak animation in 4K HDR fidelity.'
      };
      setActiveDetailShow(synthesized);
    }
  }, [dynamicCatalog]);

  // Toggle show in/out of Watchlist
  const handleToggleWatchlist = useCallback((showId: string) => {
    const existingIndex = watchlist.findIndex(w => w.showId === showId || w.id === showId);
    if (existingIndex >= 0) {
      setWatchlist(prev => prev.filter((_, i) => i !== existingIndex));
      showToast('Removed show from your Watchlist');
    } else {
      const showObj = dynamicCatalog.find(s => s.id === showId) || catalogRegistry.getAll()[0];
      const newItem: WatchlistItem = {
        id: `wl-${Date.now()}`,
        showId: showObj.id,
        title: showObj.title,
        japaneseTitle: showObj.name || '',
        status: 'Watching',
        releaseYear: showObj.first_air_date ? parseInt(showObj.first_air_date.split('-')[0]) : 2024,
        genres: showObj.genres || ['Animation', 'Action'],
        studio: showObj.studio || 'Sakuga Animation',
        score: showObj.vote_average || 9.5,
        userRating: 10,
        matchScore: showObj.matchScore || 98,
        episodesWatched: 1,
        totalEpisodes: showObj.totalEpisodes || 12,
        durationMinutes: showObj.durationMinutes || 24,
        progressPercent: 10,
        format: showObj.media_type === 'tv' ? 'TV' : 'Movies',
        posterUrl: showObj.poster_path || '/fqL8rh4U5qSY0yK00p9r1Q3j2kF.jpg',
        backdropUrl: showObj.backdrop_path || '/70Ufbdv3n2l1dEv3p4m3jL2b5z.jpg',
        notes: showObj.overview
      };
      setWatchlist(prev => [newItem, ...prev]);
      showToast(`Added "${showObj.title}" to your Watchlist!`);
    }
  }, [watchlist, dynamicCatalog, showToast]);

  // Register play and open dedicated 3rd Watch Page
  const handleRegisterPlayCard = useCallback((card: SkeletonCardItem | TmdbAnimatedShow, episodeNumber?: number) => {
    const displayTitle = (card as any).title || (card as any).name || 'Animated Show';
    
    // Resolve into full TmdbAnimatedShow
    const showId = card.id;
    const matchedShow: TmdbAnimatedShow = dynamicCatalog.find(s => s.id === showId || s.title === (card as any).title) ||
      TMDB_ANIMATED_CATALOG.find(s => s.id === showId || s.title === (card as any).title) ||
      catalogRegistry.getAll().find(s => s.id === showId || s.title === (card as any).title) ||
      (card as TmdbAnimatedShow);

    setActiveWatchShow({ show: matchedShow, episodeNumber: episodeNumber || 1 });

    const existingIndex = continueWatching.findIndex(cw => cw.showId === card.id || cw.id === card.id);
    if (existingIndex >= 0) {
      const existing = continueWatching[existingIndex];
      const updated = { ...existing, currentEpisode: episodeNumber || existing.currentEpisode, lastWatchedAt: 'Just now' };
      setContinueWatching(prev => [updated, ...prev.filter((_, i) => i !== existingIndex)]);
    } else {
      const newCW: ContinueWatchingShow = {
        id: `cw-${Date.now()}`,
        showId: card.id,
        title: displayTitle,
        currentEpisode: episodeNumber || 1,
        totalEpisodes: (card as any).totalEpisodes || 12,
        season: 1,
        episodeTitle: `Episode ${episodeNumber || 1}: The Awakening`,
        durationMinutes: (card as any).durationMinutes || 24,
        remainingMinutes: Math.round(((card as any).durationMinutes || 24) * 0.75),
        progressPercent: 25,
        posterUrl: (card as any).poster_path || '/fqL8rh4U5qSY0yK00p9r1Q3j2kF.jpg',
        backdropUrl: (card as any).backdrop_path || '/70Ufbdv3n2l1dEv3p4m3jL2b5z.jpg',
        genres: (card as any).genreTags || (card as any).genres || ['Sakuga', 'Action'],
        studio: (card as any).studio || 'Sakuga Studio',
        qualityBadge: (card as any).qualityBadges?.[0] || '4K UHD',
        matchScore: (card as any).matchScore || 98,
        sakugaHighlight: 'Dynamic fluid frame animation',
        lastWatchedAt: 'Just now'
      };
      setContinueWatching(prev => [newCW, ...prev]);
    }
    showToast(`Opening 4K Stream View for "${displayTitle}" (Ep ${episodeNumber || 1})...`);
  }, [dynamicCatalog, continueWatching, showToast]);

  // Continue Watching Action Handlers
  const handleResumeContinueWatching = useCallback((show: ContinueWatchingShow) => {
    const matched = dynamicCatalog.find(s => s.id === show.showId || s.id === show.id) || 
      TMDB_ANIMATED_CATALOG.find(s => s.id === show.showId || s.id === show.id) || 
      catalogRegistry.getAll()[0];
    handleRegisterPlayCard(matched, show.currentEpisode);
  }, [dynamicCatalog, handleRegisterPlayCard]);

  const handleAdvanceContinueWatchingEpisode = useCallback((showId: string) => {
    setContinueWatching(prev => prev.map(item => {
      if (item.id === showId || item.showId === showId) {
        const nextEp = Math.min(item.totalEpisodes, item.currentEpisode + 1);
        const nextPercent = Math.round((nextEp / item.totalEpisodes) * 100);
        const nextRemaining = Math.max(4, Math.round(item.durationMinutes * (1 - (nextEp / item.totalEpisodes))));
        showToast(`Advanced to Episode ${nextEp} of "${item.title}"`);
        return {
          ...item,
          currentEpisode: nextEp,
          progressPercent: nextPercent,
          remainingMinutes: nextRemaining,
          lastWatchedAt: 'Just now'
        };
      }
      return item;
    }));
  }, [showToast]);

  const handleRemoveContinueWatching = useCallback((showId: string) => {
    setContinueWatching(prev => prev.filter(item => item.id !== showId && item.showId !== showId));
    showToast('Removed show from Continue Watching history');
  }, [showToast]);

  const handleClearAllContinueWatching = useCallback(() => {
    setContinueWatching([]);
    showToast('Cleared Continue Watching queue');
  }, [showToast]);

  // Watchlist Action Handlers
  const handleUpdateItemStatus = useCallback((id: string, newStatus: WatchlistStatus) => {
    setWatchlist(prev => prev.map(item => {
      if (item.id === id) {
        const progress = newStatus === 'Finished' ? 100 : newStatus === 'Planned' ? 0 : item.progressPercent;
        const eps = newStatus === 'Finished' ? item.totalEpisodes : newStatus === 'Planned' ? 0 : item.episodesWatched;
        return {
          ...item,
          status: newStatus,
          progressPercent: progress,
          episodesWatched: eps
        };
      }
      return item;
    }));
  }, []);

  const handleUpdateEpisodesWatched = useCallback((id: string, delta: number) => {
    setWatchlist(prev => prev.map(item => {
      if (item.id === id) {
        const newWatched = Math.max(0, Math.min(item.totalEpisodes, (item.episodesWatched || 0) + delta));
        const newPercent = Math.round((newWatched / item.totalEpisodes) * 100);
        const newStatus: WatchlistStatus = newWatched === item.totalEpisodes ? 'Finished' : (newWatched > 0 ? 'Watching' : item.status);
        return {
          ...item,
          episodesWatched: newWatched,
          progressPercent: newPercent,
          status: newStatus
        };
      }
      return item;
    }));
  }, []);

  const handleUpdateUserRating = useCallback((id: string, rating: number) => {
    setWatchlist(prev => prev.map(item => item.id === id ? { ...item, userRating: rating } : item));
  }, []);

  const handleRemoveFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleAddToWatchlist = useCallback((newShow: Partial<WatchlistItem>) => {
    const newItem: WatchlistItem = {
      id: `wl-${Date.now()}`,
      showId: newShow.showId || `show-${Date.now()}`,
      title: newShow.title || 'New Cartoon Addition',
      japaneseTitle: newShow.japaneseTitle || '',
      status: newShow.status || 'Planned',
      releaseYear: newShow.releaseYear || 2026,
      genres: newShow.genres || ['Action', 'Adventure'],
      studio: newShow.studio || 'Sakuga Animation',
      score: newShow.score || 9.5,
      userRating: newShow.userRating || 9.0,
      matchScore: newShow.matchScore || 96,
      episodesWatched: 0,
      totalEpisodes: newShow.totalEpisodes || 12,
      durationMinutes: 24,
      progressPercent: 0,
      posterUrl: newShow.posterUrl || '/fqL8rh4U5qSY0yK00p9r1Q3j2kF.jpg',
      backdropUrl: newShow.backdropUrl || '/70Ufbdv3n2l1dEv3p4m3jL2b5z.jpg',
      notes: newShow.synopsis || 'An exciting new animated series tracked in your personal watchlist.',
      qualityBadges: ['4K UHD', '120 FPS'],
      addedAt: 'Just now'
    };

    setWatchlist(prev => [newItem, ...prev]);
    showToast(`Added "${newItem.title}" to your Watchlist!`);
  }, [showToast]);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      const hasSeen = sessionStorage.getItem('introSeen');
      return hasSeen !== 'true';
    } catch {
      return true;
    }
  });

  const [isUiEntered, setIsUiEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('introSeen') === 'true';
    } catch {
      return false;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('introSeen', 'true');
    } catch (e) {
      console.warn('Session storage write error', e);
    }
    setShowSplash(false);
    setIsUiEntered(true);
  };

  const handleSplashSkip = () => {
    try {
      sessionStorage.setItem('introSeen', 'true');
    } catch (e) {
      console.warn('Session storage write error', e);
    }
    setShowSplash(false);
    setIsUiEntered(true);
    showToast('Skipped intro ➔ Direct catalog view');
  };

  const handleReplayIntro = () => {
    setShowSplash(true);
    setIsUiEntered(false);
  };

  // Generate specialized, rich sections tailored to each active navigation tab
  const tabSections = useMemo<SkeletonSection[]>(() => {
    let sections: SkeletonSection[] = [];
    if (activeNav === 'Movies') {
      const allMovies = moviesCatalog;
      const top10Movies = allMovies.slice(0, 10);
      const ghibliAndArt = allMovies.filter(s => s.studio?.includes('Ghibli') || s.studio?.includes('CoMix') || s.genres?.includes('Fantasy') || s.genres?.includes('Adventure'));
      const superheroAndSakuga = allMovies.filter(s => s.genres?.includes('Action') || s.genres?.includes('Superhero') || s.genres?.includes('Sci-Fi'));

      sections = [
        {
          id: 'movies-top-10',
          title: 'Top 10',
          subtitle: 'The 10 highest-rated and most acclaimed animated feature films on TMDB',
          badge: 'TOP 10 MOVIES',
          isTopTen: true,
          cards: top10Movies.map((m, idx) => transformTmdbShowToSkeletonCard(m, 'Top 10', idx + 1))
        },
        {
          id: 'movies-for-you',
          title: 'For You',
          subtitle: 'Theatrical animation masterpieces with 97%+ match score and IMAX master audio',
          badge: 'FOR YOU',
          isTopTen: false,
          cards: allMovies.filter(m => (m.matchScore && m.matchScore >= 97) || m.vote_average >= 8.3).map(m => transformTmdbShowToSkeletonCard(m, 'For You'))
        },
        {
          id: 'movies-ghibli',
          title: 'Cause You Like',
          subtitle: 'Studio Ghibli & legendary hand-drawn masterworks from Hayao Miyazaki & Makoto Shinkai',
          badge: 'GHIBLI & MASTERWORKS',
          isTopTen: false,
          cards: (ghibliAndArt.length > 0 ? ghibliAndArt : allMovies).map(m => transformTmdbShowToSkeletonCard(m, 'Cause You Like'))
        },
        {
          id: 'movies-superhero',
          title: 'Explore More',
          subtitle: 'Mind-bending multiversal action, superhero blockbusters, and theatrical sakuga',
          badge: 'SUPERHERO & ACTION',
          isTopTen: false,
          cards: (superheroAndSakuga.length > 0 ? superheroAndSakuga : allMovies).map(m => transformTmdbShowToSkeletonCard(m, 'Explore More'))
        }
      ];
    }

    if (activeNav === 'Anime') {
      const allAnime = animeCatalog;
      const top10Anime = allAnime.slice(0, 10);
      const shonenSakuga = allAnime.filter(s => s.genres?.some(g => ['Action', 'Shonen', 'Sakuga', 'Supernatural'].includes(g)));
      const darkFantasy = allAnime.filter(s => s.genres?.some(g => ['Dark Fantasy', 'Cyberpunk', 'Sci-Fi', 'Mystery', 'Crime'].includes(g)));

      sections = [
        {
          id: 'anime-top-10',
          title: 'Top 10',
          subtitle: 'The top 10 anime series dominating worldwide streaming charts with 120 FPS sakuga',
          badge: 'TOP 10 ANIME',
          isTopTen: true,
          cards: top10Anime.map((a, idx) => transformTmdbShowToSkeletonCard(a, 'Top 10', idx + 1))
        },
        {
          id: 'anime-for-you',
          title: 'For You',
          subtitle: 'Hand-picked shonen phenomena, supernatural masterworks, and fluid combat choreography',
          badge: 'FOR YOU',
          isTopTen: false,
          cards: allAnime.filter(a => a.matchScore >= 97 || a.vote_average >= 8.5).map(a => transformTmdbShowToSkeletonCard(a, 'For You'))
        },
        {
          id: 'anime-shonen',
          title: 'Cause You Like',
          subtitle: 'High-impact fight choreography, domain expansions, and relentless power awakenings',
          badge: 'SHONEN SAKUGA',
          isTopTen: false,
          cards: (shonenSakuga.length > 0 ? shonenSakuga : allAnime).map(a => transformTmdbShowToSkeletonCard(a, 'Cause You Like'))
        },
        {
          id: 'anime-dark',
          title: 'Explore More',
          subtitle: 'Dystopian neon cities, psychological thrillers, and deep multi-arc dark fantasy journeys',
          badge: 'DARK FANTASY & SCI-FI',
          isTopTen: false,
          cards: (darkFantasy.length > 0 ? darkFantasy : allAnime).map(a => transformTmdbShowToSkeletonCard(a, 'Explore More'))
        }
      ];
    }

    if (activeNav === 'Toons') {
      const allToons = toonsCatalog;
      const top10Toons = allToons.slice(0, 10);
      const cnClassics = allToons.filter(s => s.studio?.includes('Cartoon Network') || s.studio?.includes('Warner Bros') || s.genres?.includes('Action'));
      const loreAndAction = allToons.filter(s => s.genres?.some(g => ['Dark Fantasy', 'Sci-Fi', 'Action', 'Adventure', 'Mystery'].includes(g)) || s.matchScore >= 98);

      sections = [
        {
          id: 'toons-top-10',
          title: 'Top 10',
          subtitle: 'The greatest western animated series, action blockbusters, and nostalgic cartoon favorites',
          badge: 'TOP 10 TOONS',
          isTopTen: true,
          cards: top10Toons.map((t, idx) => transformTmdbShowToSkeletonCard(t, 'Top 10', idx + 1))
        },
        {
          id: 'toons-for-you',
          title: 'For You',
          subtitle: 'Beloved western animation with rich lore, dynamic character arcs, and iconic art styles',
          badge: 'FOR YOU',
          isTopTen: false,
          cards: allToons.filter(t => t.matchScore >= 97 || t.vote_average >= 8.5).map(t => transformTmdbShowToSkeletonCard(t, 'For You'))
        },
        {
          id: 'toons-cn',
          title: 'Cause You Like',
          subtitle: 'Cartoon Network golden age legends, superhero teams, and action-packed nostalgic adventures',
          badge: 'ACTION & CLASSICS',
          isTopTen: false,
          cards: (cnClassics.length > 0 ? cnClassics : allToons).map(t => transformTmdbShowToSkeletonCard(t, 'Cause You Like'))
        },
        {
          id: 'toons-lore',
          title: 'Explore More',
          subtitle: 'Deep world-building, intricate fantasy lore, surreal comedy, and high-stakes animation',
          badge: 'LORE & DISCOVERY',
          isTopTen: false,
          cards: (loreAndAction.length > 0 ? loreAndAction : allToons).map(t => transformTmdbShowToSkeletonCard(t, 'Explore More'))
        }
      ];
    }

    if (activeNav === 'Newly Added') {
      const newlyAddedAll = CatalogSorter.getNewlyAddedSection(dynamicCatalog, 100);

      sections = [
        {
          id: 'newly-added-grid',
          title: 'Newly Added',
          subtitle: 'The freshest cartoons, anime, and animated movies just added to the platform.',
          badge: 'ALL NEW ARRIVALS',
          isTopTen: false,
          cards: newlyAddedAll.map(t => transformTmdbShowToSkeletonCard(t, 'Newly Added'))
        }
      ];
    }

    if (activeNav === 'Trending') {
      const trendingList = trendingCatalog;
      const top10Trending = trendingList.slice(0, 10);
      const match99 = dynamicCatalog.filter(s => s.matchScore >= 98);
      const viralSensations = dynamicCatalog.filter(s => s.vote_count >= 2000 || s.matchScore >= 97);

      sections = [
        {
          id: 'trending-top-10',
          title: 'Top 10',
          subtitle: 'The 10 hottest cartoon and anime releases with viral velocity and massive global viewership',
          badge: 'TOP 10 TRENDING',
          isTopTen: true,
          cards: top10Trending.map((t, idx) => transformTmdbShowToSkeletonCard(t, 'Top 10', idx + 1))
        },
        {
          id: 'trending-match-99',
          title: 'For You',
          subtitle: 'Near-perfect 98%+ match score animation hand-picked by our real-time recommendation engine',
          badge: '99% MATCH',
          isTopTen: false,
          cards: match99.map(t => transformTmdbShowToSkeletonCard(t, 'For You'))
        },
        {
          id: 'trending-viral',
          title: 'Cause You Like',
          subtitle: 'Global pop-culture sensations breaking records across Crunchyroll, Netflix & Max',
          badge: 'VIRAL PHENOMENA',
          isTopTen: false,
          cards: viralSensations.map(t => transformTmdbShowToSkeletonCard(t, 'Cause You Like'))
        },
        {
          id: 'trending-explore',
          title: 'Explore More',
          subtitle: 'Rapidly rising animated shows and movies trending with community viewers this week',
          badge: 'TRENDING DISCOVERY',
          isTopTen: false,
          cards: trendingList.map(t => transformTmdbShowToSkeletonCard(t, 'Explore More'))
        }
      ];
    }

    // Default Home
    const top10All = dynamicCatalog.slice(0, 10);
    const newlyAddedAll = CatalogSorter.getNewlyAddedSection(dynamicCatalog, 25);
    const multiSeasonAll = dynamicCatalog.filter(s => s.seasonCount >= 2 || s.totalEpisodes >= 15);
    const popularAll = dynamicCatalog.filter(s => s.vote_average >= 8.5 || s.matchScore >= 97);

    sections = [
      {
        id: 'home-newly-added',
        title: 'Newly Added',
        subtitle: 'The newest cartoons, anime, and movies just added to the catalog',
        badge: 'NEW ARRIVALS',
        isTopTen: false,
        onExploreClick: () => setActiveNav('Newly Added'), // Handled directly in SkeletonRow or App
        hasExploreArrow: true,
        cards: newlyAddedAll.map((item, idx) => transformTmdbShowToSkeletonCard(item, 'Newly Added', idx + 1))
      },
      {
        id: 'home-top-10',
        title: 'Top 10',
        subtitle: 'The top 10 highest-rated animations streaming right now',
        badge: 'TOP 10',
        isTopTen: true,
        cards: top10All.map((item, idx) => transformTmdbShowToSkeletonCard(item, 'Top 10', idx + 1))
      },
      {
        id: 'home-for-you',
        title: 'For You',
        subtitle: 'Top tier animations, character-driven story arcs, and multi-season sagas',
        badge: 'FOR YOU',
        isTopTen: false,
        cards: popularAll.map(item => transformTmdbShowToSkeletonCard(item, 'For You'))
      },
      {
        id: 'home-cause-you-like',
        title: 'Cause You Like',
        subtitle: 'Binge-worthy sagas, massive world-building, and long-running animation epics',
        badge: 'CAUSE YOU LIKE',
        isTopTen: false,
        cards: (multiSeasonAll.length > 0 ? multiSeasonAll : dynamicCatalog).map(item => transformTmdbShowToSkeletonCard(item, 'Cause You Like'))
      },
      {
        id: 'home-explore-more',
        title: 'Explore More',
        subtitle: 'Explore the complete animation vault from classic nostalgia to modern sakuga',
        badge: 'EXPLORE MORE',
        isTopTen: false,
        cards: dynamicCatalog.map(item => transformTmdbShowToSkeletonCard(item, 'Explore More'))
      }
    ];

    const sectionOrder = ["Newly Added", "For You", "Cause You Like", "Top 10", "Explore More"];
    return sections.sort((a, b) => {
      const indexA = sectionOrder.indexOf(a.title);
      const indexB = sectionOrder.indexOf(b.title);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }, [activeNav, dynamicCatalog, moviesCatalog, animeCatalog, toonsCatalog, trendingCatalog]);

  // Spotlight Hero Item dynamically selected based on the active navigation tab
  const activeHeroItem = useMemo<TmdbAnimatedShow>(() => {
    if (activeNav === 'Movies') {
      return dynamicCatalog.find(s => s.media_type === 'movie' || s.navType === 'Movies') || dynamicCatalog[1];
    }
    if (activeNav === 'Anime') {
      return dynamicCatalog.find(s => s.navType === 'Anime' || s.id === 'tmdb-tv-136283') || dynamicCatalog[2];
    }
    if (activeNav === 'Toons') {
      return dynamicCatalog.find(s => s.navType === 'Toons' || s.id === 'avatar-the-last-airbender' || s.id === 'tmdb-tv-94605') || dynamicCatalog[0];
    }
    if (activeNav === 'Trending') {
      return dynamicCatalog.find(s => s.matchScore >= 99) || dynamicCatalog[0];
    }
    // TV Shows tab default
    return dynamicCatalog.find(s => s.media_type === 'tv') || dynamicCatalog[0];
  }, [activeNav, dynamicCatalog]);

  // Spotlight shows list (Top 10 in rotation) tailored to the active tab
  const activeSpotlightShows = useMemo<TmdbAnimatedShow[]>(() => {
    if (activeNav === 'Movies') {
      const movies = dynamicCatalog.filter(s => s.media_type === 'movie' || s.navType === 'Movies');
      return movies.length > 0 ? movies.slice(0, 10) : dynamicCatalog.slice(0, 10);
    }
    if (activeNav === 'Anime') {
      const anime = dynamicCatalog.filter(s => s.navType === 'Anime' || s.genres?.includes('Anime'));
      return anime.length > 0 ? anime.slice(0, 10) : dynamicCatalog.slice(0, 10);
    }
    if (activeNav === 'Toons') {
      const toons = dynamicCatalog.filter(s => s.navType === 'Toons' || (s.media_type === 'tv' && s.navType !== 'Anime'));
      return toons.length > 0 ? toons.slice(0, 10) : dynamicCatalog.slice(0, 10);
    }
    if (activeNav === 'Trending') {
      const trending = dynamicCatalog.filter(s => (s.matchScore && s.matchScore >= 95) || (s.trendingRank && s.trendingRank <= 10));
      return trending.length > 0 ? trending.slice(0, 10) : dynamicCatalog.slice(0, 10);
    }
    const tv = dynamicCatalog.filter(s => s.media_type === 'tv');
    return tv.length > 0 ? tv.slice(0, 10) : dynamicCatalog.slice(0, 10);
  }, [activeNav, dynamicCatalog]);

  // Automated dynamic counters computed from catalog & sections
  const allCards = useMemo(() => {
    const map = new Map<string, SkeletonCardItem>();
    tabSections.forEach(sec => {
      sec.cards.forEach(card => {
        if (!map.has(card.id)) {
          map.set(card.id, card);
        }
      });
    });
    return Array.from(map.values());
  }, [tabSections]);

  const filteredCatalogForNav = useMemo(() => {
    if (activeNav === 'Movies') return moviesCatalog;
    if (activeNav === 'Anime') return animeCatalog;
    if (activeNav === 'Toons') return toonsCatalog;
    if (activeNav === 'Trending') return trendingCatalog;
    if (activeNav === 'Newly Added') return [...dynamicCatalog].reverse();
    if (activeNav === 'TV') return tvCatalog;
    return dynamicCatalog;
  }, [activeNav, dynamicCatalog, moviesCatalog, animeCatalog, toonsCatalog, trendingCatalog, tvCatalog]);

  const navCounts = useMemo<Record<NavTab, number>>(() => {
    return {
      Home: dynamicCatalog.length,
      TV: tvCatalog.length || 35,
      Movies: moviesCatalog.length || 14,
      Anime: animeCatalog.length || 24,
      Toons: toonsCatalog.length || 26,
      Originals: 4,
      Trending: trendingCatalog.length || 15,
      'Newly Added': dynamicCatalog.length,
      Watchlist: watchlist.length
    };
  }, [dynamicCatalog.length, tvCatalog.length, moviesCatalog.length, animeCatalog.length, toonsCatalog.length, trendingCatalog.length, watchlist.length]);

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const forYou = tabSections.find(s => s.title === 'For You')?.cards.length || 8;
    const top10 = tabSections.find(s => s.title === 'Top 10')?.cards.length || 10;
    const causeYouLike = tabSections.find(s => s.title === 'Cause You Like')?.cards.length || 8;
    const exploreMore = tabSections.find(s => s.title === 'Explore More')?.cards.length || 8;
    const totalInTab = tabSections.reduce((acc, s) => acc + s.cards.length, 0);

    return {
      All: totalInTab || 34,
      'For You': forYou,
      'Top 10': top10,
      'Cause You Like': causeYouLike,
      'Explore More': exploreMore
    };
  }, [tabSections]);

  const quickTagCounts = useMemo<Record<string, number>>(() => {
    return {
      'For You': categoryCounts['For You'] || 8,
      'Top 10': categoryCounts['Top 10'] || 10,
      'Cause You Like': categoryCounts['Cause You Like'] || 8,
      'Explore More': categoryCounts['Explore More'] || 8,
      '120 FPS Sakuga': allCards.filter(c => c.genreTags?.some(g => g.toLowerCase().includes('sakuga') || g.toLowerCase().includes('action'))).length || 8,
      'Cyber Action': allCards.filter(c => c.genreTags?.some(g => g.toLowerCase().includes('cyber') || g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('action'))).length || 11,
      'Bubbly Comedy': allCards.filter(c => c.genreTags?.some(g => g.toLowerCase().includes('comedy'))).length || 7,
      '4K Ultra HD': allCards.filter(c => c.qualityBadges?.some(b => b.includes('4K') || b.includes('UHD'))).length || 18,
    };
  }, [categoryCounts, allCards]);

  // Total matching cards for live search query feedback across the entire animated catalog
  const matchingSearchCount = useMemo(() => {
    if (!searchQuery.trim()) return allCards.length;
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/[^a-z0-9]/g, '');

    return dynamicCatalog.filter(c => {
      const title = (c.title || c.name || '').toLowerCase();
      const cleanTitle = title.replace(/[^a-z0-9]/g, '');
      const origTitle = (c.original_title || c.original_name || '').toLowerCase();
      const cleanOrigTitle = origTitle.replace(/[^a-z0-9]/g, '');
      const overview = (c.overview || '').toLowerCase();
      const studio = (c.studio || '').toLowerCase();
      const tagline = (c.tagline || '').toLowerCase();
      const genres = (c.genres || []).map(g => g.toLowerCase());
      const chars = (c.characters || []).map(ch => ch.name.toLowerCase());
      const qualityBadges = (c.qualityBadges || []).map(b => b.toLowerCase());

      if (title.includes(q) || cleanTitle.includes(cleanQ)) return true;
      if (origTitle.includes(q) || cleanOrigTitle.includes(cleanQ)) return true;
      if (overview.includes(q) || studio.includes(q) || tagline.includes(q)) return true;
      if (genres.some(g => g?.includes(q) || g?.replace(/[^a-z0-9]/g, '')?.includes(cleanQ))) return true;
      if (chars.some(ch => ch?.includes(q))) return true;
      if (qualityBadges.some(b => b?.includes(q))) return true;

      const words = `${title} ${origTitle}`.split(/\s+/);
      if (words.some(w => w.startsWith(q))) return true;
      if (cleanQ.length > 2 && (cleanQ.startsWith(cleanTitle) || cleanTitle.startsWith(cleanQ))) return true;

      return false;
    }).length;
  }, [dynamicCatalog, allCards.length, searchQuery]);

  // Filter sections and cards based on Nav toggle, Category pill, and Search
  const filteredSections = useMemo(() => {
    // If active search query: search the entire 53+ show catalog and present unified results
    if (searchQuery.trim()) {
      const matches = catalogRegistry.search(searchQuery);

      const cards = matches.map(show => transformTmdbShowToSkeletonCard(show, 'For You'));

      return [
        {
          id: 'search-results-section',
          title: `Search Results for "${searchQuery}"`,
          subtitle: `Showing ${matches.length} matching cartoons and anime shows streaming in 4K UHD with 120 FPS Sakuga`,
          badge: `${matches.length} MATCHES FOUND`,
          isTopTen: false,
          cards
        }
      ];
    }

    // Standard tab sections filtered by category pills
    return tabSections.map(section => {
      let cards = section.cards;

      // Filter by Category pill (strictly For You, Top 10, Cause You Like, Explore More)
      if (selectedCategory !== 'All') {
        const isSectionCategory = section.title === selectedCategory || section.id?.includes(selectedCategory.toLowerCase().replace(/\s+/g, '-'));
        if (!isSectionCategory) {
          cards = cards.filter(c => 
            c.category === selectedCategory || 
            c.genreTags?.some(g => g.toLowerCase().includes(selectedCategory.toLowerCase()))
          );
        }
      }

      return {
        ...section,
        cards
      };
    }).filter(sec => sec.cards.length > 0);
  }, [tabSections, selectedCategory, searchQuery, dynamicCatalog]);

  const handleSimulateRefresh = () => {
    setSections([...INITIAL_SECTIONS]);
    setApiPage(1);
    showToast('Refreshed animation catalog pipeline');
  };

  if (authLoading) {
    return (
      <div className="bg-[#040a0f] text-[#f0fdfa] h-screen flex items-center justify-center font-cartoon text-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[#00f2fe] mr-3" />
        <span>Loading X2Shows Secure Vault...</span>
      </div>
    );
  }

  if (!user) {
    return <Auth user={user} />;
  }

  return (
    <AutoErrorCatcher>
      <div className="app-shell min-h-screen bg-[#040a0f] text-[#f0fdfa] flex flex-col font-cartoon selection:bg-[#00f2fe] selection:text-[#040a0f] pb-20 relative overflow-x-hidden">
        
        {/* Auto Alert Toast Banner if Critical Issue is Found in Background */}
        {hasCriticalIssues && latestReport && (
          <div className="fixed top-3 right-3 z-50 p-3 bg-red-900 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] flex items-center gap-3 text-xs text-white">
            <span>⚠️ Auto-Auditor detected duplicate entries or down servers!</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `Fix these automatic audit issues in my app:\n\n\`\`\`json\n${JSON.stringify(latestReport, null, 2)}\n\`\`\``
                );
                showToast('Copied audit report for AI!');
              }}
              className="px-2.5 py-1 bg-[#00f2fe] text-black font-black rounded-lg border border-black hover:scale-105 cursor-pointer"
            >
              Copy AI Fix Prompt
            </button>
          </div>
        )}

        {/* 0. 5-Second Cinematic Splash Intro Screen with Session Memory & Skip Button */}

      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
          onSkip={handleSplashSkip}
        />
      )}

      {/* Main Website UI Container with Stagger Slide-Up Entrance */}
      <div className={`flex flex-col flex-1 ${isUiEntered ? 'main-ui-stagger-entrance' : ''}`}>
        
        {/* If Active Watch Show is selected: Render the Dedicated 3rd Watch Page */}
        {activeWatchShow ? (
          <WatchPage
            show={activeWatchShow.show}
            initialEpisodeNumber={activeWatchShow.episodeNumber || 1}
            onBack={() => setActiveWatchShow(null)}
            onSelectShow={(nextShow) => setActiveWatchShow({ show: nextShow, episodeNumber: 1 })}
            onToggleWatchlist={handleToggleWatchlist}
            isInWatchlist={watchlist.some(w => w.showId === activeWatchShow.show.id || w.id === activeWatchShow.show.id)}
            onShowToast={showToast}
          />
        ) : activeDetailShow ? (
          <ShowDetailPage
            show={activeDetailShow}
            onBack={() => setActiveDetailShow(null)}
            onPlayShow={handleRegisterPlayCard}
            onToggleWatchlist={handleToggleWatchlist}
            isInWatchlist={watchlist.some(w => w.showId === activeDetailShow.id || w.id === activeDetailShow.id)}
            onSelectShow={(nextShow) => setActiveDetailShow(nextShow)}
            onShowToast={showToast}
          />
        ) : (
          <>
            {/* 1. Header & Navigation with Watchlist Tab and Live Dynamic Badges */}
            <HeaderNav
              activeNav={activeNav}
              onSelectNav={(nav) => {
                setActiveNav(nav);
                setSelectedCategory('All');
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              aspectRatio={aspectRatio}
              onToggleAspectRatio={setAspectRatio}
              shimmerSpeed={shimmerSpeed}
              onChangeShimmerSpeed={setShimmerSpeed}
              watchlistCount={watchlist.length}
              watchlist={watchlist}
              catalog={dynamicCatalog}
              navCounts={navCounts}
              quickTagCounts={quickTagCounts}
              totalCatalogCount={allCards.length}
              matchingSearchCount={matchingSearchCount}
              onReplayIntro={handleReplayIntro}
              onOpenShowDetails={(show) => handleOpenShowDetails(show)}
              onPlayShow={(show) => handleRegisterPlayCard(show)}
              onViewAllSearchResults={(query) => {
                setSearchQuery(query);
                setSelectedCategory('All');
              }}
              onShowToast={showToast}
            />

            {/* Conditional View: If Watchlist is active, show WatchlistView; if Search query active, show SearchResultsFilterView; otherwise show CategoriesBar + Hero + Sections */}
            {activeNav === 'Watchlist' ? (
              <main className="flex-1 anim-tab-fade-slide" key="watchlist-view">
                <WatchlistView
                  watchlist={watchlist}
                  aspectRatio={aspectRatio}
                  onUpdateItemStatus={handleUpdateItemStatus}
                  onUpdateEpisodesWatched={handleUpdateEpisodesWatched}
                  onUpdateUserRating={handleUpdateUserRating}
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  onPlayShow={(item, epNum) => {
                    const matched = dynamicCatalog.find(s => s.id === item.showId || s.id === item.id) || catalogRegistry.getAll()[0];
                    handleRegisterPlayCard(matched, epNum);
                  }}
                  onOpenDetails={(item) => handleOpenShowDetails(item)}
                  onQuickAddShow={handleAddToWatchlist}
                  onShowToast={showToast}
                />
              </main>
            ) : searchQuery.trim() || (activeNav !== 'Home' && activeNav !== 'Originals') ? (
              <main className="flex-1 anim-tab-fade-slide" key="search-results-filter-view">
                <SearchResultsFilterView
                  initialQuery={searchQuery.trim()}
                  catalog={searchQuery.trim() ? dynamicCatalog : filteredCatalogForNav}
                  aspectRatio={aspectRatio}
                  onOpenDetails={(show) => handleOpenShowDetails(show)}
                  onPlayShow={(show) => handleRegisterPlayCard(show)}
                  onToggleWatchlist={handleToggleWatchlist}
                  isInWatchlist={(id) => watchlist.some(w => w.showId === id || w.id === id)}
                  onShowToast={showToast}
                  onBackToHome={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setActiveNav('Home');
                  }}
                />
              </main>
            ) : (
              <div key={activeNav} className="tab-transition-container anim-tab-fade-slide flex flex-col flex-1">
                {/* 2. Categories Horizontal Scroll Bar with Dynamic Badges */}
                <CategoriesBar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categoryCounts={categoryCounts}
                  onShowToast={showToast}
                />

                {/* Dynamic Real-Time Catalog Vault Counter Banner */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#07151e] via-[#0d2836] to-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-[#14b8a6] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] modern-cartoony-number">
                        {(activeNav as string) === 'Movies' ? `🎬 ${navCounts.Movies} MOVIES IN TOTAL` :
                         (activeNav as string) === 'Anime' ? `✨ ${navCounts.Anime} ANIME IN TOTAL` :
                         (activeNav as string) === 'Toons' ? `🎨 ${navCounts.Toons} CARTOON SHOWS IN TOTAL` :
                         (activeNav as string) === 'Originals' ? `⭐ ${navCounts.Originals} ORIGINALS IN TOTAL` :
                         (activeNav as string) === 'Trending' ? `🔥 ${navCounts.Trending} TRENDING TOONS` :
                         `📺 ${navCounts.TV} TV SHOWS IN TOTAL`}
                      </span>

                      {selectedCategory !== 'All' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#facc15] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000] animate-pulse">
                          ⚡ Filtered to: {selectedCategory} ({categoryCounts[selectedCategory] || 6} shows)
                        </span>
                      )}

                      {searchQuery && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00f2fe] text-black font-black text-[11px] border border-black shadow-[1px_1px_0px_#000000]">
                          🔍 Search Match: "{searchQuery}" ({matchingSearchCount} found)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#99f6e4]">
                      <button
                        onClick={() => {
                          setIsDualApiModalOpen(true);
                          showToast('Opening Live Dual API Fallback (TMDB + TVmaze) Inspector...');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#14b8a6]/20 hover:bg-[#14b8a6] text-[#00f2fe] hover:text-black font-black text-xs border border-[#14b8a6]/50 transition-all cursor-pointer flex items-center gap-1.5"
                        title="Inspect TMDB & TVmaze Dual Fallback"
                      >
                        <Zap className="w-3.5 h-3.5 fill-[#00f2fe]" />
                        <span>Dual API Engine</span>
                      </button>

                      <span className="hidden sm:inline">
                        TMDB Catalog: <strong className="text-white font-black">{allCards.length} Loaded (Page {apiPage})</strong>
                      </span>
                      <button
                        onClick={() => {
                          setActiveNav('Watchlist');
                          showToast('Switched to My Watchlist with real-time stackable genre counters');
                        }}
                        className="px-3 py-1 rounded-xl bg-[#00f2fe] hover:bg-[#38bdf8] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000] transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Open Watchlist ({watchlist.length})</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Results Dedicated Banner when search query is active */}
                {searchQuery.trim() && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                    <div className="flex items-center justify-between p-4 rounded-3xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#14b8a6] to-[#00f2fe] border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_#000000]">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-black text-white">
                              Search Results for <span className="text-[#00f2fe]">"{searchQuery}"</span>
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#14b8a6] text-black font-black text-xs border border-black shadow-[1.5px_1.5px_0px_#000000]">
                              {matchingSearchCount} SHOWS FOUND
                            </span>
                          </div>
                          <p className="text-xs text-[#7dd3fc]">
                            Displaying matching animated TV series, movies, and anime from our 4K UHD streaming catalog
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All');
                            showToast('Search query cleared. Returned to home feed.');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#99f6e4] font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Search</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Hero Billboard Skeleton (Featured Spotlight in Teal & Light Blue with 10-Show 7s Rotation) */}
                {!searchQuery && selectedCategory === 'All' && activeNav === 'Home' && (
                  <HeroBillboardSkeleton
                    heroItem={activeHeroItem || dynamicCatalog[0] || catalogRegistry.getAll()[0]}
                    spotlightShows={activeSpotlightShows.length > 0 ? activeSpotlightShows : dynamicCatalog.slice(0, 10)}
                    onOpenCardDetails={(cardId) => {
                      const found = dynamicCatalog.find(s => s.id === cardId) || tabSections.flatMap(s => s.cards).find(c => c.id === cardId);
                      if (found) handleOpenShowDetails(found);
                      else handleOpenShowDetails(activeHeroItem || dynamicCatalog[0]);
                    }}
                    onPlayHero={(heroItem) => {
                      const item = heroItem || activeHeroItem || dynamicCatalog[0];
                      handleRegisterPlayCard(item);
                    }}
                    onReplayIntro={handleReplayIntro}
                    onShowToast={showToast}
                  />
                )}

                {/* 4. Continue Watching Section: Positioned Under the Spotlight and Above 'For You' */}
                {!searchQuery && selectedCategory === 'All' && activeNav === 'Home' && continueWatching.length > 0 && (
                  <ContinueWatchingRow
                    items={continueWatching}
                    aspectRatio={aspectRatio}
                    onResumeShow={handleResumeContinueWatching}
                    onAdvanceEpisode={handleAdvanceContinueWatchingEpisode}
                    onRemoveItem={handleRemoveContinueWatching}
                    onOpenDetails={(cwShow) => {
                      const matched = dynamicCatalog.find(s => s.id === (cwShow as any).showId || s.id === cwShow.id);
                      if (matched) handleOpenShowDetails(matched);
                      else handleOpenShowDetails(cwShow as any);
                    }}
                    onClearAll={handleClearAllContinueWatching}
                    onShowToast={showToast}
                  />
                )}

                {/* 5. Main Content Area: Curated Skeleton Rows (Horizontal for Home Page, Vertical for Other Categories) */}
                <main className="content-area flex-1 space-y-4">
                  {filteredSections.length === 0 ? (
                    <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#031822]/90 border-2 border-[#00f2fe]/30 text-center space-y-4 shadow-2xl">
                      <div className="w-14 h-14 rounded-full bg-[#14b8a6]/20 flex items-center justify-center mx-auto text-[#00f2fe] border-2 border-[#00f2fe]/40">
                        <Smile className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-white">No Toon Cards Match Filters</h3>
                        <p className="text-xs text-[#99f6e4]">
                          Reset your category pill or clear search to restore For You, Top 10, Cause You Like & Explore More.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSearchQuery('');
                          setActiveNav('Home');
                          showToast('Reset all filters to default');
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#0284c7] hover:from-[#00f2fe] hover:to-[#38bdf8] text-white text-xs font-black shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredSections.map(section => {
                      const isHorizontal = selectedCategory === 'All' && !searchQuery.trim() && (activeNav as string) !== 'Newly Added';
                      return (
                        <SkeletonRow
                          key={section.id}
                          section={section}
                          aspectRatio={aspectRatio}
                          isHomePage={isHorizontal}
                          layoutMode={isHorizontal ? 'horizontal' : 'vertical'}
                          onOpenDetails={handleOpenShowDetails}
                          onPlay={handleRegisterPlayCard}
                          onShowToast={showToast}
                        />
                      );
                    })
                  )}

                  {/* 6. Dynamic TMDB Infinite Scroll & "Load More Toons" Trigger */}
                  <div ref={infiniteScrollRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <button
                        id="load-more-toons-btn"
                        onClick={handleLoadMoreToons}
                        disabled={isLoadingMore}
                        className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl bg-gradient-to-r from-[#14b8a6] via-[#00f2fe] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#0284c7] text-black font-black text-sm sm:text-base border-[3px] border-black shadow-[6px_6px_0px_#000000] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>FETCHING TMDB PAGE {apiPage + 1}...</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-5 h-5 stroke-[3]" />
                            <span>LOAD MORE TOONS (TMDB PAGE {apiPage + 1})</span>
                          </>
                        )}
                      </button>

                      {/* Auto-Fetch Toggle Switch (Allows user to pause / resume background auto-fetch) */}
                      <button
                        onClick={() => {
                          const next = !isAutoFetchEnabled;
                          setIsAutoFetchEnabled(next);
                          showToast(next ? 'Auto-Fetch Infinite Scroll: ENABLED' : 'Auto-Fetch Infinite Scroll: PAUSED');
                        }}
                        className={`px-5 py-3.5 rounded-3xl border-[3px] border-black font-black text-xs sm:text-sm transition-all shadow-[4px_4px_0px_#000000] cursor-pointer flex items-center gap-2 ${
                          isAutoFetchEnabled
                            ? 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
                            : 'bg-[#0d2836] text-[#99f6e4] hover:bg-[#14b8a6] hover:text-black'
                        }`}
                        title="Toggle automatic background fetch when scrolling to bottom"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full border border-black ${isAutoFetchEnabled ? 'bg-white animate-ping' : 'bg-neutral-500'}`} />
                        <span>Auto-Fetch: {isAutoFetchEnabled ? 'ON (Scroll active)' : 'PAUSED'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#99f6e4] font-bold text-center flex-wrap justify-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0d2836] border border-black text-[#00f2fe] font-black shadow-[1px_1px_0px_#000000]">
                        ✨ {dynamicCatalog.length} Total Shows Loaded
                      </span>
                      <span>• Appends directly into For You, Cause You Like & Explore More</span>
                    </div>
                  </div>
                </main>
              </div>
            )}
          </>
        )}

        {/* 7. Skeleton Drawer Modal (Secondary Quick Inspect) */}
        <SkeletonDrawerModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onShowToast={showToast}
        />

        {/* 8. Floating Shell Controls with Replay Intro and Dual API triggers */}
        <ShellControlsFloating
          aspectRatio={aspectRatio}
          onToggleAspectRatio={setAspectRatio}
          shimmerSpeed={shimmerSpeed}
          onChangeShimmerSpeed={setShimmerSpeed}
          onSimulateRefresh={handleSimulateRefresh}
          onReplayIntro={handleReplayIntro}
          onOpenDualApiModal={() => setIsDualApiModalOpen(true)}
          onShowToast={showToast}
        />

        {/* 9. Movable, Draggable & Collapsible Vertical Taskbar (Home, Search, Settings, Watchlist, Dual API) */}
        <MovableVerticalTaskbar
          watchlistCount={watchlist.length}
          activeNav={activeNav}
          catalogShows={dynamicCatalog}
          onSelectNav={(nav) => {
            setActiveNav(nav);
            if (nav !== 'TV') setSelectedCategory('All');
            setSearchQuery('');
          }}
          onOpenSearch={() => {
            setSearchQuery(' ');
            showToast('Opened Search Vault with lower-middle search bar and stackable filters');
          }}
          onOpenSettings={() => {
            const next = aspectRatio === '2:3' ? '16:9' : '2:3';
            setAspectRatio(next);
            showToast(`Taskbar Settings: Aspect Ratio toggled to ${next}`);
          }}
          onOpenWatchlist={() => {
            setActiveNav('Watchlist');
            showToast('Opened Watchlist via Taskbar');
          }}
          onOpenDualApi={() => {
            setIsDualApiModalOpen(true);
            showToast('Opened Dual API Inspector via Taskbar');
          }}
          onShowToast={showToast}
          isBugsVisible={isBugsVisible}
          onToggleBugs={handleToggleBugs}
          isMascotVisible={isMascotVisible}
          onToggleMascot={handleToggleMascot}
          isMatrixOpen={isMatrixOpen}
          onToggleMatrix={handleToggleMatrix}
        />

      </div>

      {/* 10. Dual API Fallback & Cache Inspector Modal */}
      <DualApiStatusModal
        isOpen={isDualApiModalOpen}
        onClose={() => setIsDualApiModalOpen(false)}
        onShowToast={showToast}
      />

      {/* 11. Toast Notification Feedback */}
      <ToastNotification message={toastMessage} />

      {/* Global SVG Shader Filters */}
      <GlobalShaderProvider />

      {/* 🔴 FLOATING BUTTON THAT OPENS THE LIVE BOT HUD */}
      <AiAgentMatrixModal isOpen={isMatrixOpen} onClose={handleToggleMatrix} />

      {/* Visual cyber bugs patrolling the screen */}
      <CyberBugSwarm isVisible={isBugsVisible} />

      {/* 🔴 THE ANIMATED WALKING MASCOT */}
      <MascotCurator isVisible={isMascotVisible} />

      {/* Developer Diagnostics & Self-Healing Panel (Ctrl + Shift + D) */}
      <React.Suspense fallback={null}>
        <DeveloperDiagnosticsPanel isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
      </React.Suspense>

    </div>
    </AutoErrorCatcher>
  );
}
