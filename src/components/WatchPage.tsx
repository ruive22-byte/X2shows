import { assertIdentity, ContentIdentityMismatchError } from '../services/resolvers/ContentIdentityValidator';
import { DiagnosticPanel } from "./DiagnosticPanel";
import React, { useState, useEffect, useRef } from 'react';
import {   
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, SkipForward, SkipBack, Settings, 
  Sparkles, X, ChevronRight, ChevronDown, Check, Eye, Sliders, 
  Server, Tv, Film, Star, Heart, Plus, Share2, 
  ArrowLeft, ShieldCheck, Zap, Layers, RefreshCw, Radio,
  Tv2, Keyboard, Users, Folder, FolderOpen, PlayCircle, Cpu, ExternalLink
} from 'lucide-react';
import {  motion, AnimatePresence } from 'motion/react';
import {  TmdbAnimatedShow, TMDB_ANIMATED_CATALOG } from '../data/tmdbData';
import {  TmdbImage } from './TmdbImage';
import {  getRelatedShows } from '../utils/relatedResolver';
import {  globalCatalogIndex } from '../utils/globalCatalog';
import {  ServerSelector } from './ServerSelector';
import {  SeasonFetcherService, Episode } from '../services/seasonFetcherService';
import {  createTmdbShowId, createSeasonNumber, createEpisodeNumber } from '../types/identifiers';
import {  appEvents } from '../events/EventEmitter';
import {  WatchProgressTracker } from '../utils/watchProgressTracker';
import {  PlaybackStateHelper, PlaybackSettings } from '../utils/playbackStateHelper';
import {  PlayerButtonFactory } from '../utils/playerButtonFactory';
import {  UpscaleConfig, UpscalerResolver } from '../utils/upscalerResolver';
import {  UpscalerControlBar } from './UpscalerControlBar';
import {  DynamicShaderEngine, ShaderUpscaler } from '../utils/shaderUpscaler';
import {  CustomSubtitleLoader, SubtitleResolver } from '../utils/subtitleResolver';
import {  LatencyTracker, ServerPingResult, ServerManager, ServerResolver, StreamServer } from '../utils/serverResolver';
import {  StreamResolver as NewStreamResolver, StreamCandidate } from '../services/resolvers/StreamResolver';
import { PlaybackProbe, PlaybackHealth } from '../services/resolvers/PlaybackProbe';
import { Loader2 } from 'lucide-react';
import { AlertTriangle,  Upload } from 'lucide-react';
import {  usePlaybackQuery } from '../hooks/usePlaybackQuery';

interface WatchPageProps {

  show: TmdbAnimatedShow;
  initialEpisodeNumber?: number;
  initialSeasonNumber?: number;
  onBack: () => void;
  onSelectShow: (show: TmdbAnimatedShow) => void;
  onToggleWatchlist: (showId: string) => void;
  isInWatchlist: boolean;
  onShowToast: (msg: string) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  show,
  initialEpisodeNumber = 1,
  initialSeasonNumber = 1,
  onBack,
  onSelectShow,
  onToggleWatchlist,
  isInWatchlist,
  onShowToast,
}) => {
  const [openSeasons, setOpenSeasons] = useState<Record<number, boolean>>({ 1: true });

  const {
    isLoading: isLoadingEpisodes,
    result,
    activeSeason: selectedSeason,
    activeEpisode: currentEpisode,
    activeServerId: selectedServerId,
    changeEpisode,
    updateProgress,
    setActiveServerId: setSelectedServerId,
    orchestratedMedia
  } = usePlaybackQuery(show, initialSeasonNumber, initialEpisodeNumber);

  const seasonEpisodesMap = result?.seasonEpisodesMap || {};
  const serverLatencies = result?.serverLatencies || {};
  const [localResumeTime, setLocalResumeTime] = useState<number | null>(null);
  const resumeTime = localResumeTime !== null ? localResumeTime : (result?.resumeTime || 0);
  const isMovie = result?.isMovie || (show.media_type === 'movie' || show.navType === 'Movies' || (show.durationMinutes && show.durationMinutes > 60));
  const totalSeasons = result?.totalSeasons || show.seasonCount || (isMovie ? 1 : 2);
  const relatedShows = result?.relatedShows || [];

  const [isServerLoading, setIsServerLoading] = useState<boolean>(false);

  // Player & Theater state
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1440);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const initialPlaybackSettings = PlaybackStateHelper.getSettings();
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(initialPlaybackSettings.defaultSpeed || 1);
  const [qualitySetting, setQualitySetting] = useState<string>('2160p 4K UHD');

  // Controls & Upscaling Toggles
  const [upscaleConfig, setUpscaleConfig] = useState<UpscaleConfig>(UpscalerResolver.PRESETS.off);
  const [shaderMode, setShaderMode] = useState<'off' | 'anime_super_res' | '4k_ultra_edge'>('off');
  const [sharpenStrength, setSharpenStrength] = useState<number>(0.0);
  const [subtitleLanguage, setSubtitleLanguage] = useState<string>('en-cc');
  const [customSubtitleTracks, setCustomSubtitleTracks] = useState<{ id: string; label: string; url: string }[]>([]);
  const [volumeBoost, setVolumeBoost] = useState<string>(String(initialPlaybackSettings.volumeBoost || 100));
  const [autoPlay, setAutoPlay] = useState<boolean>(initialPlaybackSettings.autoPlay);
  const [autoNext, setAutoNext] = useState<boolean>(initialPlaybackSettings.autoNext);
  const [autoSkip, setAutoSkip] = useState<boolean>(initialPlaybackSettings.autoSkip);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [useIframeEmbed, setUseIframeEmbed] = useState<boolean>(true);
  const [showSubSettingsOverlay, setShowSubSettingsOverlay] = useState<boolean>(false);
  const [showAiGpuOverlay, setShowAiGpuOverlay] = useState<boolean>(false);
  const [showGpuShaderDashboard, setShowGpuShaderDashboard] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync player time to the query controller for autosaving
  useEffect(() => {
    updateProgress(currentTime, duration);
  }, [currentTime, duration, updateProgress]);

  const togglePictureInPicture = async () => {
    try {
      const videoElement = playerContainerRef.current?.querySelector('video') || document.querySelector('video');
      if (videoElement) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await (videoElement as any).requestPictureInPicture();
        }
      } else {
        onShowToast('Picture-In-Picture: Active on stream viewport');
      }
    } catch {
      onShowToast('Picture-in-Picture active');
    }
  };

  const handleCustomSubtitleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        const custom = await CustomSubtitleLoader.processLocalSubtitleFile(file);
        const newTrack = { id: `custom-${Date.now()}`, label: custom.label, url: custom.url };
        setCustomSubtitleTracks(prev => [...prev, newTrack]);
        setSubtitleLanguage(newTrack.id);
        onShowToast(`Loaded custom subtitle: ${file.name}`);
      } catch {
        onShowToast('Failed to parse subtitle file');
      }
    }
  };

  const handleCustomSubtitleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const custom = await CustomSubtitleLoader.processLocalSubtitleFile(file);
        const newTrack = { id: `custom-${Date.now()}`, label: custom.label, url: custom.url };
        setCustomSubtitleTracks(prev => [...prev, newTrack]);
        setSubtitleLanguage(newTrack.id);
        onShowToast(`Loaded custom subtitle: ${file.name}`);
      } catch {
        onShowToast('Failed to parse subtitle file');
      }
    }
  };

  const displayTitle = show.title || show.name || 'Animated Show';

  // Media Orchestration State
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>('');
  const [streamCandidate, setStreamCandidate] = useState<StreamCandidate | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playbackHealth, setPlaybackHealth] = useState<PlaybackHealth>('idle');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  
  // Create a ref to hold the current probe
  const probeRef = useRef<PlaybackProbe | null>(null);

  useEffect(() => {
    if (!orchestratedMedia) {
      setPlaybackHealth('resolving');
      return;
    }
    
    if (orchestratedMedia.resolution.errors.includes('CONTENT_MISMATCH')) {
      setPlaybackHealth('blocked');
      setPlaybackError('CONTENT_MISMATCH: The selected source does not match the requested show identity.');
      return;
    }

    const candidates = orchestratedMedia.streamCandidates;
    if (candidates.length === 0) {
      setPlaybackHealth('failed');
      setPlaybackError('No stream candidates available.');
      return;
    }
    
    // Auto-recovery flow
    let active = true;
    
    const tryCandidate = async (idx: number) => {
      if (idx >= candidates.length) {
        if (active) {
          setPlaybackHealth('failed');
          setPlaybackError('All stream candidates failed.');
        }
        return;
      }
      
      const candidate = candidates[idx];
      setPlaybackHealth('resolving'); // Checking source
      setActiveStreamUrl(candidate.url);
      setStreamCandidate(candidate);
      
      // Verify Identity BEFORE Activation
      try {
          assertIdentity(
              orchestratedMedia.resolution.identity,
              candidate.requestedIdentity
          );
      } catch (e) {
          if (e instanceof ContentIdentityMismatchError) {
              setPlaybackError("IDENTITY_MISMATCH: The selected candidate violates the required media identity. Rejecting source.");
              setPlaybackHealth("failed");
              tryCandidate(idx + 1);
              return;
          }
      }

      const checkedCandidate = await NewStreamResolver.checkCandidate(candidate);
      if (checkedCandidate.verificationStatus === "FAILED") {
        if (active) {
          tryCandidate(idx + 1);
        }
      } else {
        if (active) {
          // Initialize Probe
          if (probeRef.current) probeRef.current.stop();
          const probe = new PlaybackProbe((status) => {
             if (active) setPlaybackHealth(status);
          });
          probeRef.current = probe;
          
          probe.start(candidate, () => iframeRef.current).then(result => {
             if (!active) return;
             if (result.status === "FAILED") {
                 setPlaybackError(`${result.reason}: Playback failed.`);
                 setCandidateIndex(idx + 1); // Auto-recover
             } else if (result.status === "UNVERIFIABLE") {
                 console.warn("Playback is unverifiable due to provider restriction.");
                 setPlaybackError("UNVERIFIABLE: Cannot confirm playback health.");
             } else {
                 console.log("Playback verified with confidence:", result.confidence);
             }
          });
        }
      }
    };
    
    tryCandidate(candidateIndex);
    
  

  return () => { 
        active = false; 
        if (probeRef.current) probeRef.current.stop();
    };
  }, [orchestratedMedia, candidateIndex]);
  
  const streamUrlWithResume = `${activeStreamUrl}${resumeTime > 0 ? `&start=${resumeTime}` : ''}`;

  const currentSelectedServer = ServerManager.getServers().find(s => s.id === selectedServerId);
  const isRunningInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const isPopoutRequired = currentSelectedServer && (
    !currentSelectedServer.supportsEmbed ||
    (currentSelectedServer.requiresTopLevelWindow && isRunningInIframe)
  );

  // Combined WebGL / CSS Canvas Filter Style for Upscaling and Edge Reconstruction
  const combinedFilterStyle = React.useMemo(() => {
    const upscalerStyle = UpscalerResolver.getCanvasFilterStyle(upscaleConfig);
    const shaderStyle = ShaderUpscaler.getFilterStyle(shaderMode);
    const dynamicSharpenStyle = DynamicShaderEngine.getDynamicKernelFilter(sharpenStrength);

    const filters: string[] = [];

    if (upscalerStyle.filter) filters.push(String(upscalerStyle.filter));
    if (shaderStyle.filter) filters.push(String(shaderStyle.filter));
    if (dynamicSharpenStyle.filter) filters.push(String(dynamicSharpenStyle.filter));

    return {
      ...upscalerStyle,
      ...shaderStyle,
      ...dynamicSharpenStyle,
      filter: filters.length > 0 ? filters.join(' ') : undefined,
      imageRendering: 'crisp-edges' as const,
      WebkitBackfaceVisibility: 'hidden' as const,
      transform: 'translateZ(0)',
    };
  }, [upscaleConfig, shaderMode, sharpenStrength]);

  // Always synchronize stream URL immediately whenever season, episode, or server changes
  useEffect(() => {
    let url = '';
    if (orchestratedMedia && orchestratedMedia.streamCandidates.length > 0) {
      const match = orchestratedMedia.streamCandidates.find(c => c.sourceProvider === selectedServerId);
      if (match) {
        url = match.url;
        setStreamCandidate(match);
      }
    }
    if (!url) {
      url = ServerManager.buildStreamUrl(show, selectedServerId, selectedSeason, currentEpisode);
    }
    setActiveStreamUrl(url);
    setCandidateIndex(0);
  }, [show, selectedSeason, currentEpisode, selectedServerId, orchestratedMedia]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          setIsTheaterMode(p => !p);
          onShowToast(`Theater Mode ${!isTheaterMode ? 'Enabled' : 'Disabled'}`);
          break;
        case 'j':
          e.preventDefault();
          setCurrentTime(t => Math.max(0, t - 10));
          break;
        case 'l':
          e.preventDefault();
          setCurrentTime(t => Math.min(duration, t + 10));
          break;
        case 'arrowleft':
          e.preventDefault();
          setCurrentTime(t => Math.max(0, t - 5));
          break;
        case 'arrowright':
          e.preventDefault();
          setCurrentTime(t => Math.min(duration, t + 5));
          break;
        case 'n':
          e.preventDefault();
          handleNextEpisode();
          break;
        case 'p':
          e.preventDefault();
          handlePrevEpisode();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isTheaterMode, selectedSeason, currentEpisode]);

  const handleNextEpisode = () => {
    const currentList = seasonEpisodesMap[selectedSeason] || [];
    const maxEpisodes = currentList.length > 0 ? currentList.length : 24;
    if (currentEpisode < maxEpisodes) {
      changeEpisode(selectedSeason, currentEpisode + 1);
      onShowToast(`Switched to Episode ${currentEpisode + 1}`);
    } else if (selectedSeason < totalSeasons) {
      changeEpisode(selectedSeason + 1, 1);
      onShowToast(`Switched to Season ${selectedSeason + 1} • Episode 1`);
    } else {
      onShowToast(`Reached final episode of ${displayTitle}`);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      changeEpisode(selectedSeason, currentEpisode - 1);
      onShowToast(`Switched to Episode ${currentEpisode - 1}`);
    } else if (selectedSeason > 1) {
      const prevSeasonEpisodes = seasonEpisodesMap[selectedSeason - 1] || [];
      const prevEpNum = prevSeasonEpisodes.length > 0 ? prevSeasonEpisodes.length : 24;
      changeEpisode(selectedSeason - 1, prevEpNum);
      onShowToast(`Switched to Season ${selectedSeason - 1} • Ep ${prevEpNum}`);
    } else {
      onShowToast(`Already at Season 1 • Episode 1`);
    }
  };

  const handleServerChange = (serverId: string) => {
    setSelectedServerId(serverId);
    let newUrl = '';
    if (orchestratedMedia) {
      const candidate = orchestratedMedia.streamCandidates.find(c => c.sourceProvider === serverId);
      if (candidate) {
        newUrl = candidate.url;
        setStreamCandidate(candidate);
      }
    }
    if (!newUrl) {
      newUrl = ServerManager.buildStreamUrl(show, serverId, selectedSeason, currentEpisode);
    }
    setActiveStreamUrl(newUrl);
    setIsServerLoading(true);
    const srv = ServerManager.getServers().find(s => s.id === serverId);
    onShowToast(`Switching stream to ${srv?.name || 'Server'}...`);
    setTimeout(() => {
      setIsServerLoading(false);
      onShowToast(`Connected to ${srv?.name}!`);
    }, 400);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const toggleSeasonFolder = (sNum: number) => {
    setOpenSeasons(prev => ({ ...prev, [sNum]: !prev[sNum] }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const isResolving = isLoadingEpisodes;

  return (
    <div className="min-h-screen bg-[#03090d] text-white flex flex-col font-sans selection:bg-[#14b8a6] selection:text-black">
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="sticky top-0 z-40 bg-[#07151e]/95 backdrop-blur-md border-b-2 border-black px-4 sm:px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#00f2fe] font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-[#7dd3fc] font-bold truncate">
              <span className="hidden sm:inline hover:text-white transition-colors cursor-pointer" onClick={onBack}>Home</span>
              <span className="hidden sm:inline text-gray-500">/</span>
              <span className="truncate hover:text-white transition-colors cursor-pointer" onClick={onBack}>{displayTitle}</span>
              <span className="text-gray-500">/</span>
              <span className="text-[#14b8a6] font-black underline underline-offset-4">
                {isMovie ? 'Watching Movie' : `Season ${selectedSeason} • Ep ${currentEpisode}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14b8a6]/20 border border-[#14b8a6]/50 text-[#00f2fe] text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14b8a6]" />
              <span>4K SAKUGA STREAM</span>
            </span>

            <button
              onClick={() => onToggleWatchlist(show.id)}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer ${
                isInWatchlist ? 'bg-[#14b8a6] text-black' : 'bg-[#0d2836] text-white hover:bg-[#14b8a6] hover:text-black'
              }`}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
              <span className="hidden sm:inline">{isInWatchlist ? 'In Watchlist' : 'Add to List'}</span>
            </button>
          </div>
        </div>
      </header>

      <DiagnosticPanel 
        orchestratedMedia={orchestratedMedia} 
        activeCandidate={orchestratedMedia?.streamCandidates[candidateIndex] || null} 
        playbackHealth={playbackHealth}
        iframeRef={iframeRef}
      />
      {/* 2. MAIN WATCH PAGE GRID LAYOUT */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-6 py-4 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR: Compact Show Poster & Small Overview                      */}
          {/* ======================================================================= */}
          <div className={`${isTheaterMode ? 'lg:col-span-2 xl:col-span-2' : 'lg:col-span-2 xl:col-span-2'} space-y-4`}>
            
            {/* Show Poster Card */}
            <div className="group relative aspect-[2/3] max-w-[220px] mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000]">
              <TmdbImage 
                item={show}
                posterPath={show.posterUrl || show.poster_path}
                backdropPath={show.backdropUrl || show.backdrop_path}
                type="poster"
                title={displayTitle}
                name={show.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="hidden lg:block text-sm text-[#99f6e4] leading-relaxed">
              <p className="line-clamp-4">{show.overview}</p>
            </div>
          </div>
          
          {/* ======================================================================= */}
          {/* RIGHT SIDE: Video Player & Sub-Controls                                */}
          {/* ======================================================================= */}
          <div className={`${isTheaterMode ? 'lg:col-span-10 xl:col-span-10' : 'lg:col-span-7 xl:col-span-7'} space-y-4`}>
            
            <div className="rounded-2xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] overflow-hidden p-1.5 sm:p-2">
              <div 
                className={`relative w-full bg-black rounded-xl overflow-hidden shadow-inner ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}
                style={{ ...combinedFilterStyle }}
              >
                {isPopoutRequired ? (
                  <div className="w-full h-full bg-[#051119] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00f2fe]/10 via-transparent to-black pointer-events-none" />
                    <div className="relative z-10 max-w-md space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#14b8a6] to-[#00f2fe] border-2 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center text-black">
                        <ExternalLink className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {currentSelectedServer?.name || 'Selected Server'}
                        </h3>
                        <p className="text-xs text-[#99f6e4] font-bold mt-1 uppercase tracking-wider">
                          Top-Level Window Required
                        </p>
                        <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                          This provider enforces anti-framing security policies when loaded inside embedded preview frames. Launch the stream in a clean top-level tab or switch to an embed-compatible server below.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                        <button
                          onClick={() => window.open(activeStreamUrl || streamUrlWithResume, '_blank')}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#14b8a6] text-black font-black text-xs hover:brightness-110 transition-all cursor-pointer border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2"
                        >
                          <span>Launch Stream in New Tab</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleServerChange(ServerManager.getDefaultServer().id)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0d2836] text-white hover:bg-[#14b8a6]/20 font-black text-xs transition-all cursor-pointer border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#00f2fe]" />
                          <span>Switch to Embedded Server ({ServerManager.getDefaultServer().name})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Video Player Screen (Full Controls & Overlay Feature Parity) */
                  <div className="relative w-full h-full bg-[#03090d] flex items-center justify-center overflow-hidden">
                    {/* Embedded Iframe Stream */}
                    {activeStreamUrl && playbackHealth !== 'blocked' && (
                      <iframe
                        ref={iframeRef}
                        src={streamUrlWithResume}
                        className="absolute inset-0 w-full h-full border-none z-10"
                        referrerPolicy="no-referrer"
                        allowFullScreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
                        title={`Streaming ${displayTitle}`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-20" />


                    {/* Dark Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

                    {/* Server Switch Loading Overlay */}
                    <AnimatePresence>
                      {isServerLoading && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-3"
                        >
                          <RefreshCw className="w-10 h-10 text-[#00f2fe] animate-spin" />
                          <p className="text-sm font-black text-white">
                            Resolving Stream Route on <span className="text-[#14b8a6]">{ServerManager.getServers().find(s => s.id === selectedServerId)?.name}</span>...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Center Play Button Overlay */}
                    {!isPlaying && !isServerLoading && (
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#00f2fe] text-black border-4 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center transform hover:scale-110 transition-all cursor-pointer"
                      >
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black translate-x-0.5" />
                      </button>
                    )}

                    {/* Top Bar inside player */}
                    <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between text-xs font-black text-white bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 truncate">
                        <span className="px-2 py-0.5 rounded bg-[#14b8a6] text-black text-[10px] uppercase font-black">
                          {ServerManager.getServers().find(s => s.id === selectedServerId)?.badge || '4K'}
                        </span>
                        <span className="truncate">
                          {displayTitle} {isMovie ? '' : `• Season ${selectedSeason} Ep ${currentEpisode}`}
                        </span>
                      </div>
                      <button
                        onClick={() => window.open(activeStreamUrl || streamUrlWithResume, '_blank')}
                        className="px-2.5 py-1 rounded-lg bg-[#00f2fe] text-black text-[10px] font-black hover:bg-[#14b8a6] transition-all cursor-pointer shadow-[1px_1px_0px_#000000] flex items-center gap-1"
                        title="Open stream in clean tab to bypass preview iframe sandbox restrictions"
                      >
                        <span>Popout Player</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Floating Settings Menu Overlay Popup inside the Player Screen */}
                    <AnimatePresence>
                      {showSubSettingsOverlay && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute bottom-16 right-3 z-40 w-[92%] sm:w-[400px] max-h-[82%] overflow-y-auto bg-[#07151e]/95 backdrop-blur-xl border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000000] p-3.5 text-white space-y-3 cursor-default"
                        >
                          <div className="flex items-center justify-between border-b border-white/15 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Settings className="w-4 h-4 text-[#00f2fe] animate-spin" />
                              <span className="text-xs font-black uppercase tracking-wider text-[#00f2fe]">
                                Subtitles, Speed & Audio
                              </span>
                            </div>
                            <button
                              onClick={() => setShowSubSettingsOverlay(false)}
                              className="p-1 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Subtitles & Custom Subtitle Loader */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-[#facc15] flex items-center gap-1">
                              <Folder className="w-3.5 h-3.5" /> Subtitles
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={subtitleLanguage}
                                onChange={(e) => {
                                  setSubtitleLanguage(e.target.value);
                                  onShowToast(`Subtitles: ${e.target.value.toUpperCase()}`);
                                }}
                                className="flex-1 bg-[#0d2836] border border-white/20 rounded-xl px-2 py-1.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                              >
                                {SubtitleResolver.getTracksForShow('tv').map((track) => (
                                  <option key={track.id} value={track.id} className="bg-[#07151e]">
                                    {track.label}
                                  </option>
                                ))}
                                {customSubtitleTracks.map((custom) => (
                                  <option key={custom.id} value={custom.id} className="bg-[#07151e]">
                                    {custom.label}
                                  </option>
                                ))}
                                <option value="off" className="bg-[#07151e]">Off</option>
                              </select>

                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2.5 py-1.5 bg-[#1e3a4c] hover:bg-[#00f2fe] hover:text-black text-xs font-black text-[#00f2fe] rounded-xl border border-white/20 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>.SRT/.VTT</span>
                              </button>
                            </div>
                          </div>

                          {/* Speed & Volume Boost */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-[#38bdf8]">Speed</span>
                              <select
                                value={playbackSpeed}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setPlaybackSpeed(val);
                                  PlaybackStateHelper.updateSetting('defaultSpeed', val);
                                }}
                                className="w-full bg-[#0d2836] border border-white/20 rounded-xl px-2 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
                              >
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1.0x Normal</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2.0x</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase text-[#86efac]">Volume Booster</span>
                              <select
                                value={volumeBoost}
                                onChange={(e) => {
                                  setVolumeBoost(e.target.value);
                                  onShowToast(`Audio Boost: ${e.target.value}%`);
                                }}
                                className="w-full bg-[#0d2836] border border-white/20 rounded-xl px-2 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
                              >
                                <option value="100">100% Normal</option>
                                <option value="150">150% Boost</option>
                                <option value="200">200% Max</option>
                                <option value="300">300% Ultra Gain</option>
                              </select>
                            </div>
                          </div>

                          {/* Playback Actions */}
                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase text-[#00f2fe]">Playback Actions</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {PlayerButtonFactory.createButton({
                                id: 'pip-toggle-btn-sub',
                                label: 'PIP',
                                icon: '🖼️',
                                color: 'cyan',
                                onClick: () => togglePictureInPicture(),
                              })}

                              {PlayerButtonFactory.createButton({
                                id: 'auto-skip-btn-sub',
                                label: autoSkip ? 'SKIP ON' : 'SKIP OFF',
                                active: autoSkip,
                                color: autoSkip ? 'green' : 'dark',
                                onClick: () => {
                                  const next = !autoSkip;
                                  setAutoSkip(next);
                                  PlaybackStateHelper.updateSetting('autoSkip', next);
                                  onShowToast(`Auto Skip: ${next ? 'ENABLED' : 'DISABLED'}`);
                                },
                              })}

                              {PlayerButtonFactory.createButton({
                                id: 'auto-next-btn-sub',
                                label: autoNext ? 'NEXT ON' : 'NEXT OFF',
                                active: autoNext,
                                color: autoNext ? 'amber' : 'dark',
                                onClick: () => {
                                  const next = !autoNext;
                                  setAutoNext(next);
                                  PlaybackStateHelper.updateSetting('autoNext', next);
                                  onShowToast(`Auto Next: ${next ? 'ENABLED' : 'DISABLED'}`);
                                },
                              })}

                              {PlayerButtonFactory.createButton({
                                id: 'auto-play-btn-sub',
                                label: autoPlay ? 'PLAY ON' : 'PLAY OFF',
                                active: autoPlay,
                                color: autoPlay ? 'cyan' : 'dark',
                                onClick: () => {
                                  const next = !autoPlay;
                                  setAutoPlay(next);
                                  PlaybackStateHelper.updateSetting('autoPlay', next);
                                  onShowToast(`Auto Play: ${next ? 'ENABLED' : 'DISABLED'}`);
                                },
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {showAiGpuOverlay && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute bottom-16 right-3 z-40 w-[92%] sm:w-[420px] max-h-[82%] overflow-y-auto bg-[#07151e]/95 backdrop-blur-xl border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000000] p-3.5 text-white space-y-3 cursor-default"
                        >
                          <div className="flex items-center justify-between border-b border-white/15 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-[#00f2fe] animate-pulse" />
                              <span className="text-xs font-black uppercase tracking-wider text-[#00f2fe]">
                                AI GPU Upscaler & Shaders
                              </span>
                            </div>
                            <button
                              onClick={() => setShowAiGpuOverlay(false)}
                              className="p-1 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* AI GPU Upscaler Presets */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-gray-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" /> AI GPU Upscaler Profile
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {Object.values(UpscalerResolver.PRESETS).map((preset) => {
                                const modeName = preset.mode === 'anime_ultra' ? 'Anime Ultra 4K' : preset.mode === 'sharp_4k' ? '4K Crisp Edge' : preset.mode === 'hdr_vivid' ? 'HDR Vivid' : 'Native Off';
                                const subLabel = preset.mode === 'anime_ultra' ? 'Line-art Sharpen' : preset.mode === 'sharp_4k' ? '2160p Upscale' : preset.mode === 'hdr_vivid' ? 'Color + Contrast' : 'Standard Raw';
                                return (
                                  <button
                                    key={preset.mode}
                                    onClick={() => {
                                      setUpscaleConfig(preset);
                                      onShowToast(`GPU AI Upscaler set to ${modeName}`);
                                    }}
                                    className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                                      upscaleConfig.mode === preset.mode
                                        ? 'bg-[#00f2fe] text-black border-black font-black shadow-[2px_2px_0px_#000]'
                                        : 'bg-[#0d2836] text-gray-200 border-white/10 hover:bg-[#1e3a4c]'
                                    }`}
                                  >
                                    <div className="text-[11px] font-extrabold truncate">{modeName}</div>
                                    <div className="text-[9px] opacity-80">{subLabel}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* WebGL Shader Mode */}
                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase text-gray-300 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-[#14b8a6]" /> WebGL Shader Processing
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { id: 'anime_super_res', label: 'Anime Line' },
                                { id: '4k_ultra_edge', label: '4K Edge' },
                                { id: 'off', label: 'Native Off' },
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setShaderMode(item.id as any);
                                    onShowToast(`Shader Engine: ${item.label}`);
                                  }}
                                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black border text-center cursor-pointer transition-all ${
                                    shaderMode === item.id
                                      ? 'bg-[#14b8a6] text-black border-black shadow-[2px_2px_0px_#000]'
                                      : 'bg-[#0d2836] text-gray-300 border-white/10'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* GPU Sharpen Kernel Strength Slider */}
                          <div className="space-y-1 pt-2 border-t border-white/10">
                            <div className="flex justify-between items-center text-[10px] font-black">
                              <span className="text-[#f43f5e] flex items-center gap-1">
                                <Sliders className="w-3.5 h-3.5" /> GPU Sharpen Kernel:
                              </span>
                              <span className="font-mono text-white bg-[#0d2836] px-1.5 py-0.5 rounded border border-white/10">
                                {sharpenStrength.toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={5}
                              step={0.1}
                              value={sharpenStrength}
                              onChange={(e) => setSharpenStrength(parseFloat(e.target.value))}
                              className="w-full accent-[#f43f5e] cursor-pointer h-1.5 rounded-lg"
                            />
                          </div>

                          {/* Quality Selection */}
                          <div className="space-y-1 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase text-[#14b8a6]">Stream Output Quality</span>
                            <select
                              value={qualitySetting}
                              onChange={(e) => {
                                setQualitySetting(e.target.value);
                                onShowToast(`Quality set to ${e.target.value}`);
                              }}
                              className="w-full bg-[#0d2836] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                            >
                              <option value="2160p 4K UHD">2160p 4K UHD</option>
                              <option value="1080p Full HD">1080p Full HD</option>
                              <option value="720p HD">720p HD</option>
                              <option value="480p SD">480p SD</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Player Bottom Control Bar */}
                    <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1.5">
                      <div className="space-y-1">
                        <input 
                          type="range"
                          min={0}
                          max={duration}
                          value={currentTime}
                          onChange={(e) => setCurrentTime(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-gray-300 font-bold">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-[#14b8a6] hover:text-black transition-colors cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                          </button>

                          <button 
                            onClick={handlePrevEpisode}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            title="Previous Episode"
                          >
                            <SkipBack className="w-4 h-4" />
                          </button>

                          <button 
                            onClick={handleNextEpisode}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            title="Next Episode"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>

                          <div className="hidden sm:flex items-center gap-1.5">
                            <button 
                              onClick={() => setIsMuted(!isMuted)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input 
                              type="range" min={0} max={1} step={0.05} 
                              value={isMuted ? 0 : volume}
                              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                              className="w-14 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                            className="bg-black/80 text-[10px] font-bold text-white border border-white/20 rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
                          >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1.0x</option>
                            <option value={1.25}>1.25x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2.0x</option>
                          </select>

                          {/* Player Settings Toggle Button (Next to 1.x Speed) */}
                          <button 
                            onClick={() => {
                              setShowSubSettingsOverlay(!showSubSettingsOverlay);
                              setShowAiGpuOverlay(false);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              showSubSettingsOverlay 
                                ? 'bg-[#00f2fe] text-black border-[#00f2fe] shadow-[0_0_12px_#00f2fe]' 
                                : 'bg-white/10 text-white border-white/20 hover:bg-[#00f2fe] hover:text-black hover:border-[#00f2fe]'
                            }`}
                            title="Subtitles, Speed & Audio Controls"
                          >
                            <Settings className={`w-4 h-4 ${showSubSettingsOverlay ? 'animate-spin' : ''}`} />
                          </button>

                          {/* AI GPU Upscaler & WebGL Shader Animated Graphic Button */}
                          <button 
                            onClick={() => {
                              setShowAiGpuOverlay(!showAiGpuOverlay);
                              setShowSubSettingsOverlay(false);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
                              showAiGpuOverlay 
                                ? 'bg-[#ea580c] text-white border-[#ea580c] shadow-[0_0_12px_#ea580c]' 
                                : 'bg-gradient-to-tr from-[#9333ea] to-[#db2777] text-white border-transparent hover:scale-105 active:scale-95 shadow-[0_0_8px_rgba(147,51,234,0.4)]'
                            }`}
                            title="AI GPU Upscaler & WebGL Shaders"
                          >
                            <Sparkles className={`w-4 h-4 relative z-10 ${showAiGpuOverlay ? 'animate-bounce' : 'animate-pulse'}`} />
                            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>

                          <button 
                            onClick={toggleFullscreen}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-[#14b8a6] hover:text-black transition-colors cursor-pointer"
                            title="Fullscreen"
                          >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            {/* Compact Resume & Play Tag directly under the player instead of long green banner */}
            {resumeTime > 0 && (
              <div className="inline-flex items-center gap-2.5 p-1.5 px-3 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/40 text-[#00f2fe] text-xs font-black shadow-[2px_2px_0px_#000000]">
                <span>▶ Resuming S{selectedSeason} E{currentEpisode} at {formatTime(resumeTime)}</span>
                <button 
                  onClick={() => {
                    setLocalResumeTime(0);
                    onShowToast(`Started Season ${selectedSeason} Ep ${currentEpisode} from beginning!`);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[#00f2fe] hover:bg-white text-black font-bold text-[10px] uppercase border border-black transition-all cursor-pointer"
                >
                  Start from beginning
                </button>
              </div>
            )}

            {/* UNDER THE VIDEOPLAYER: THEATER MODE, SHORTCUTS, W2G, TOGGLES */}
            <div className="p-3 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3">
              
              {/* Green Action Bar */}
              <div className="p-2.5 rounded-2xl bg-[#07151e] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] font-black text-[#22c55e]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>152 WATCHING NOW</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsTheaterMode(!isTheaterMode);
                      onShowToast(`Theater Mode ${!isTheaterMode ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-black font-black text-[11px] border border-black cursor-pointer hover:scale-105 transition-all ${
                      isTheaterMode ? 'bg-[#38ef7d]' : 'bg-[#22c55e]'
                    }`}
                  >
                    THEATER
                  </button>
                  <button
                    onClick={() => setShowShortcutsModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#22c55e] text-black font-black text-[11px] border border-black cursor-pointer hover:scale-105 transition-all"
                  >
                    KEYS
                  </button>
                  <button
                    onClick={() => onShowToast('Watch Party Created! W2G Room URL copied.')}
                    className="px-2.5 py-1 rounded-lg bg-[#22c55e] text-black font-black text-[11px] border border-black cursor-pointer hover:scale-105 transition-all"
                  >
                    W2G
                  </button>
                  <button
                    onClick={() => {
                      setAutoPlay(!autoPlay);
                      onShowToast(`Auto Play ${!autoPlay ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-black text-[11px] border border-black cursor-pointer transition-all ${
                      autoPlay ? 'bg-[#22c55e] text-black' : 'bg-black/60 text-gray-400'
                    }`}
                  >
                    AUTO PLAY
                  </button>
                  <button
                    onClick={() => {
                      setAutoNext(!autoNext);
                      onShowToast(`Auto Next ${!autoNext ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-black text-[11px] border border-black cursor-pointer transition-all ${
                      autoNext ? 'bg-[#22c55e] text-black' : 'bg-black/60 text-gray-400'
                    }`}
                  >
                    AUTO NEXT
                  </button>
                  <button
                    onClick={() => {
                      setAutoSkip(!autoSkip);
                      onShowToast(`Auto Skip Intro ${!autoSkip ? 'Enabled' : 'Disabled'}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-black text-[11px] border border-black cursor-pointer transition-all ${
                      autoSkip ? 'bg-[#22c55e] text-black' : 'bg-black/60 text-gray-400'
                    }`}
                  >
                    AUTO SKIP
                  </button>
                  <button
                    onClick={() => onToggleWatchlist(show.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#22c55e] text-black font-black text-[11px] border border-black cursor-pointer hover:scale-105 transition-all"
                  >
                    {isInWatchlist ? 'IN LIST ✓' : 'ADD TO LIST ▾'}
                  </button>
                </div>
              </div>

              {/* Direct Embed vs HTML5 Player Mode Switcher */}
              <div className="p-3.5 rounded-2xl bg-[#0a1924] border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#00f2fe]/10 text-[#00f2fe]">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase text-white tracking-wider block">
                      Video Playback Mode
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold block">
                      {useIframeEmbed ? 'Using secure iframe direct embeds' : 'Using high-performance WebGL HTML5 custom player'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUseIframeEmbed(!useIframeEmbed);
                    onShowToast(`Switched to ${!useIframeEmbed ? 'Direct Iframe Embed' : 'HTML5 WebGL Player'}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black border border-black cursor-pointer transition-all flex items-center gap-1.5 ${
                    useIframeEmbed 
                      ? 'bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black shadow-[2px_2px_0px_#000000] hover:scale-105' 
                      : 'bg-gradient-to-r from-[#ea580c] to-[#e11d48] text-white shadow-[2px_2px_0px_#000000] hover:scale-105'
                  }`}
                >
                  <span>{useIframeEmbed ? '🚀 Direct Embed Active' : '⚡ HTML5 Player Active'}</span>
                  <span className="text-[9px] opacity-75">(Switch)</span>
                </button>
              </div>

              {/* Multi-Server Streaming Setup Component */}
              <ServerSelector
                activeServerId={selectedServerId}
                onSelectServer={handleServerChange}
                activeStreamUrl={activeStreamUrl || streamUrlWithResume}
              />
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT SIDE: SEASONS & EPISODES + LOWER RIGHT RELATED STUFF              */}
          {/* ======================================================================= */}
          <div className={`${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-3 xl:col-span-3'} space-y-6`}>
            
            {/* SEASONS AND EPISODES SECTION ON THE RIGHT */}
            <div className="p-4 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#14b8a6]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Seasons & Episodes
                  </h3>
                </div>
                <span className="text-[10px] text-[#00f2fe] font-black">
                  {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
                </span>
              </div>

              {isLoadingEpisodes ? (
                <div className="py-8 text-center text-xs text-[#7dd3fc] font-bold animate-pulse">
                  Loading season guide...
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => {
                    const episodes = seasonEpisodesMap[sNum] || [];
                    const isOpen = !!openSeasons[sNum];

                    return (
                      <div key={sNum} className="rounded-xl bg-[#0d2836] border border-black overflow-hidden">
                        
                        {/* Folder Season Accordion Header */}
                        <button
                          onClick={() => toggleSeasonFolder(sNum)}
                          className="w-full px-3 py-2.5 bg-[#0d2836] hover:bg-[#14b8a6]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs font-black text-white">
                            {isOpen ? <FolderOpen className="w-4 h-4 text-[#00f2fe]" /> : <Folder className="w-4 h-4 text-[#14b8a6]" />}
                            <span>Season {sNum}</span>
                            <span className="text-[10px] font-normal text-gray-400">
                              ({episodes.length} Episode{episodes.length > 1 ? 's' : ''})
                            </span>
                          </div>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-[#14b8a6]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        {/* Unfolded Episode List inside Season Folder */}
                        {isOpen && (
                          <div className="p-2 bg-[#030d14] space-y-1.5 border-t border-black">
                            {episodes.map((ep) => {
                              const isCurrent = selectedSeason === sNum && currentEpisode === ep.number;
                              return (
                                <div
                                  key={ep.id}
                                  onClick={() => {
                                    changeEpisode(sNum, ep.number);
                                    onShowToast(`Playing Season ${sNum} Ep ${ep.number}: ${ep.title}`);
                                  }}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 group ${
                                    isCurrent 
                                      ? 'bg-[#14b8a6]/20 border-[#00f2fe] text-white shadow-[1px_1px_0px_#00f2fe]' 
                                      : 'bg-[#07151e] border-black/80 hover:bg-[#0d2836] text-gray-300'
                                  }`}
                                >
                                  {/* Episode Thumbnail Picture */}
                                  <div className="relative w-16 h-10 rounded-md overflow-hidden bg-black/80 border border-black/80 flex-shrink-0 group-hover:border-[#00f2fe] transition-all">
                                    <img
                                      src={ep.stillUrl || show.backdropUrl || show.posterUrl || `https://image.tmdb.org/t/p/w500${show.backdrop_path || show.poster_path}`}
                                      alt={`Episode ${ep.number}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      loading="lazy"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (show.backdropUrl && target.src !== show.backdropUrl) {
                                          target.src = show.backdropUrl;
                                        }
                                      }}
                                    />
                                    <div className={`absolute bottom-0.5 left-0.5 px-1 rounded text-[8px] font-black ${
                                      isCurrent ? 'bg-[#00f2fe] text-black' : 'bg-black/80 text-[#14b8a6]'
                                    }`}>
                                      E{ep.number}
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <h5 className="text-xs font-bold truncate group-hover:text-[#00f2fe]">
                                        {ep.title}
                                      </h5>
                                      <span className="text-[9px] font-mono text-gray-400">{ep.runtimeMinutes || 24}m</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 line-clamp-1">{ep.overview}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LOWER RIGHT: RELATED STUFF */}
            <div className="p-4 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#facc15]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Related Stuff
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {relatedShows.map((relShow, index) => {
                  const relTitle = relShow.title || relShow.name || 'Toon';
                
                    return ( <div
                      key={`watch-rel-${relShow.id}-${index}`}
                      onClick={() => {
                        onSelectShow(relShow);
                        onShowToast(`Opened ${relTitle}`);
                      }}
                      className="group rounded-xl bg-[#0d2836] border border-black p-2 space-y-1.5 hover:border-[#00f2fe] shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                    >
                      <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-black relative">
                        <TmdbImage 
                          item={relShow}
                          backdropPath={relShow.backdropUrl || relShow.backdrop_path}
                          posterPath={relShow.posterUrl || relShow.poster_path}
                          type="backdrop"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1 right-1 px-1 rounded bg-black/80 text-[8px] font-black text-[#facc15]">
                          ★ {relShow.vote_average || 8.5}
                        </div>
                      </div>

                      <h5 className="text-[11px] font-black text-white truncate group-hover:text-[#00f2fe]">
                        {relTitle}
                      </h5>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* KEYBOARD SHORTCUTS MODAL */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowShortcutsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-[#07151e] border-2 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-[#00f2fe]" />
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <button 
                  onClick={() => setShowShortcutsModal(false)}
                  className="p-1 rounded-xl bg-[#0d2836] hover:bg-red-500 hover:text-black text-gray-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-bold text-gray-300">
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">Space / K</span>
                  <span>Play / Pause</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">← →</span>
                  <span>Seek 5s</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">J / L</span>
                  <span>Seek 10s</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">0–9</span>
                  <span>Jump to 0–90%</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">F</span>
                  <span>Fullscreen</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">T</span>
                  <span>Theater mode</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-xl bg-[#0d2836] border border-black">
                  <span className="font-mono text-[#00f2fe]">N / P</span>
                  <span>Next / Previous episode</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#030d14] border border-[#14b8a6]/40 text-[11px] text-[#7dd3fc] leading-normal">
                Shortcuts pause after clicking inside the player — click anywhere on the page to get them back.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
