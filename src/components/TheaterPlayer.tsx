import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, SkipForward, SkipBack, Settings, 
  Sparkles, X, ChevronRight, Check, Eye, Sliders, 
  Layers, Disc, Monitor, Tv, MessageSquare, BatteryCharging,
  Zap, Smartphone, Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Show, Episode } from '../types';
import { ServerManager, EMBED_SERVERS, resolveWorkingServer } from '../utils/serverResolver';

interface TheaterPlayerProps {
  show: Show | null;
  episodeNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectEpisode: (epNum: number) => void;
}

export const TheaterPlayer: React.FC<TheaterPlayerProps> = ({
  show,
  episodeNumber,
  isOpen,
  onClose,
  onSelectEpisode,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(320); // 5m 20s
  const [duration, setDuration] = useState(2580); // 43 mins
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('4K Ultra HD (60fps)');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState('English [CC]');
  const [audioTrack, setAudioTrack] = useState('Japanese (Original Dolby Atmos 7.1)');
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [sakugaFilter, setSakugaFilter] = useState<'vivid' | 'cyber' | 'noir' | 'standard'>('vivid');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activeServerId, setActiveServerId] = useState<string>('server-1');
  const [useEmbedPlayer, setUseEmbedPlayer] = useState<boolean>(false);
  const [probingServers, setProbingServers] = useState<boolean>(false);
  
  // Mobile & Performance 60 FPS Safeguards
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mobileLowPowerBypass, setMobileLowPowerBypass] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'rewind' | 'forward'; time: string } | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setMobileLowPowerBypass(true); // Automatically bypass heavy canvas rendering for 60 FPS on mobile
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto health probe fastest embed server on open
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setProbingServers(true);
    resolveWorkingServer(EMBED_SERVERS).then((fastest) => {
      if (isMounted && fastest) {
        setActiveServerId(fastest.id);
      }
    }).finally(() => {
      if (isMounted) setProbingServers(false);
    });
    return () => { isMounted = false; };
  }, [isOpen]);

  const currentEpisode: Episode = show?.episodes.find(e => e.number === episodeNumber) || show?.episodes[0] || {
    id: 'ep-fallback',
    number: 1,
    season: 1,
    title: 'Episode 1: The Awakening',
    duration: '43m',
    durationSeconds: 2580,
    thumbnailUrl: '',
    synopsis: '',
    airDate: '',
    progressPercent: 20,
    keyTimestamps: [
      { time: '01:30', seconds: 90, label: 'Title Intro' },
      { time: '14:20', seconds: 860, label: 'Hyper-Kinetic Combat' },
      { time: '38:45', seconds: 2325, label: 'Climax & Cliffhanger' },
    ],
    rating: 9.8
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        triggerSeek(10, 'forward');
      } else if (e.code === 'ArrowLeft') {
        triggerSeek(-10, 'rewind');
      } else if (e.code === 'KeyM') {
        setIsMuted(prev => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, duration, onClose]);

  const triggerSeek = (delta: number, type: 'rewind' | 'forward') => {
    setCurrentTime(prev => {
      const next = Math.max(0, Math.min(duration, prev + delta));
      return next;
    });
    setSeekFeedback({ type, time: `${delta > 0 ? '+' : ''}${delta}s` });
    setTimeout(() => setSeekFeedback(null), 700);
  };

  // Simulated playback timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, duration, playbackSpeed]);

  // Touch gesture handler for mobile: single tap for controls, double tap left/right to seek
  const handleTouchViewport = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const width = rect.width;

    if (now - lastTapRef.current.time < 300) {
      // Double tap detected
      if (touchX < width * 0.38) {
        triggerSeek(-10, 'rewind');
      } else if (touchX > width * 0.62) {
        triggerSeek(10, 'forward');
      } else {
        setIsPlaying(prev => !prev);
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: touchX };
      setControlsVisible(prev => !prev);
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  };

  // Canvas visual dynamic particle & light wave generation (Skipped on mobile / low-power for 60 FPS)
  useEffect(() => {
    if (!isOpen || mobileLowPowerBypass) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick += isPlaying ? 1 : 0.2;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 450;

      // Dark obsidian base
      ctx.fillStyle = '#08070B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic animated Sakuga light waves in Maroon & Electric Blue
      const grad = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(tick * 0.02) * 100,
        canvas.height / 2 + Math.cos(tick * 0.02) * 60,
        30,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7
      );

      if (sakugaFilter === 'vivid') {
        grad.addColorStop(0, 'rgba(128, 0, 32, 0.45)');
        grad.addColorStop(0.5, 'rgba(37, 99, 235, 0.35)');
        grad.addColorStop(1, 'rgba(10, 9, 13, 0.95)');
      } else if (sakugaFilter === 'cyber') {
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.6)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
        grad.addColorStop(1, 'rgba(10, 9, 13, 0.95)');
      } else {
        grad.addColorStop(0, 'rgba(80, 5, 20, 0.5)');
        grad.addColorStop(1, 'rgba(8, 7, 11, 0.98)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Anime speed lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const y = ((tick * (2 + i)) % canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, (y + 40) % canvas.height);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, isPlaying, sakugaFilter, mobileLowPowerBypass]);

  if (!isOpen || !show) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div 
      id="theater-player-modal"
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none touch-none"
      onMouseMove={handleMouseMove}
    >
      {/* Ambient Maroon & Electric Blue Backglow */}
      {ambientGlow && (
        <div className="absolute inset-0 pointer-events-none opacity-60 transition-opacity duration-1000">
          <div className="absolute top-1/4 left-10 w-[450px] h-[450px] rounded-full bg-[#800020]/40 blur-[160px] animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] rounded-full bg-[#2563EB]/35 blur-[160px] animate-pulse" />
        </div>
      )}

      {/* Main Video Viewport Container */}
      <div 
        className="relative w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center bg-[#07060A]"
        onTouchEnd={handleTouchViewport}
      >
        
        {/* Mobile Shader Bypass: If mobile or low-power bypass is active, use 60 FPS lightweight CSS radial gradient */}
        {mobileLowPowerBypass ? (
          <div className="w-full h-full absolute inset-0 bg-[#0A090D] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(128,0,32,0.45)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,rgba(37,99,235,0.4)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A090D] via-transparent to-[#0A090D]/80" />
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        )}

        {/* Video Poster Image Overlay under lighting */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 mix-blend-overlay">
          <img 
            src={show.backdropUrl || show.heroPosterUrl} 
            alt={show.title} 
            loading="lazy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Sandboxed Embed Iframe Stream Layer with Anti-Redirect Sandbox */}
        {useEmbedPlayer && (
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
            <iframe
              src={ServerManager.buildStreamUrl(show as any, activeServerId, currentEpisode.season, currentEpisode.number)}
              className="w-full h-full border-0 rounded-xl"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          </div>
        )}

        {/* Double-tap Seek Feedback Overlays */}
        <AnimatePresence>
          {seekFeedback && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className={`absolute top-1/2 -translate-y-1/2 z-40 px-6 py-4 rounded-3xl bg-black/80 border border-white/20 backdrop-blur-xl flex items-center gap-3 shadow-2xl ${
                seekFeedback.type === 'rewind' ? 'left-12' : 'right-12'
              }`}
            >
              {seekFeedback.type === 'rewind' ? (
                <RotateCcw className="w-6 h-6 text-rose-400 animate-spin" />
              ) : (
                <RotateCw className="w-6 h-6 text-blue-400 animate-spin" />
              )}
              <span className="text-lg font-bold font-mono-code text-white">
                {seekFeedback.time}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Intro Floating Button (Available in first 90s) */}
        {currentTime < 90 && (
          <button
            onClick={() => setCurrentTime(92)}
            className="absolute bottom-24 right-4 sm:right-8 z-30 px-4 py-2.5 rounded-xl bg-black/85 hover:bg-rose-950 border border-white/20 hover:border-rose-500 text-white text-xs font-bold font-mono-code transition-all shadow-2xl flex items-center gap-2 cursor-pointer"
          >
            <SkipForward className="w-4 h-4 text-blue-400" />
            <span>Skip Intro (01:30)</span>
          </button>
        )}

        {/* Active Subtitles Display */}
        {subtitlesEnabled && (
          <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
            <div className="px-4 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-amber-200 text-xs sm:text-base font-semibold text-center border border-white/10 shadow-2xl max-w-2xl">
              {currentTime < 30 ? (
                <span>[Orchestral Overture Plays • 120 FPS Master Track]</span>
              ) : currentTime < 120 ? (
                <span>{currentEpisode.synopsis || "“The power we seek cannot be bound by council laws.”"}</span>
              ) : (
                <span>“In the deep dark of Zaun, electric sparks remember what the surface forgot.”</span>
              )}
            </div>
          </div>
        )}

        {/* Top Floating Header Overlay */}
        <div 
          className={`absolute top-0 left-0 right-0 z-30 p-3 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              id="player-back-btn"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-rose-900/80 border border-white/10 text-white transition-colors cursor-pointer shrink-0"
              title="Exit Player (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono-code text-rose-400 font-bold truncate">
                <span>{show.title}</span>
                <span>•</span>
                <span>S{currentEpisode.season}:E{currentEpisode.number}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-blue-300 font-bold">{videoQuality}</span>
              </div>
              <h2 className="text-xs sm:text-lg font-bold text-white font-display truncate">
                {currentEpisode.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Embed Stream / Studio Visuals Toggle */}
            <button
              onClick={() => setUseEmbedPlayer(!useEmbedPlayer)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono-code font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                useEmbedPlayer 
                  ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-lg' 
                  : 'bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Toggle Live Embed Stream vs Studio Visual Player"
            >
              <Tv className="w-3.5 h-3.5 text-blue-400" />
              <span>{useEmbedPlayer ? 'Embed Live' : 'Studio Visuals'}</span>
              {probingServers && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </button>

            {/* Visual Sakuga Enhancer Preset Button */}
            <button
              onClick={() => {
                const modes: ('vivid' | 'cyber' | 'noir' | 'standard')[] = ['vivid', 'cyber', 'noir', 'standard'];
                const next = modes[(modes.indexOf(sakugaFilter) + 1) % modes.length];
                setSakugaFilter(next);
              }}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono-code font-bold items-center gap-1.5 border border-white/10 cursor-pointer"
              title="Cycle Visual Equalizer Filter"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sakugaFilter.toUpperCase()}</span>
            </button>

            {/* Episode Drawer Toggle */}
            <button
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Episodes</span>
              <span>({show.episodes.length})</span>
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
              title="Audio, Subtitles & Quality Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Bottom Floating Control Bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 space-y-2 sm:space-y-3 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          
          {/* Progress Timeline Scrubber */}
          <div className="relative group cursor-pointer py-1">
            <div 
              className="h-1.5 group-hover:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = clickX / rect.width;
                setCurrentTime(newPct * duration);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-[#800020] via-purple-600 to-[#2563EB] rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Chapter Cues markers */}
            {currentEpisode.keyTimestamps?.map((ts, idx) => (
              <div
                key={idx}
                className="absolute top-1 w-1 h-2 bg-amber-400/80 rounded-full"
                style={{ left: `${(ts.seconds / duration) * 100}%` }}
                title={`${ts.time}: ${ts.label}`}
              />
            ))}
          </div>

          {/* Controls Bottom Row: Play/Pause, Seek, Volume, Timers, Fullscreen */}
          <div className="flex items-center justify-between text-white">
            
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Play / Pause */}
              <button
                id="player-play-toggle-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 sm:p-2.5 rounded-full bg-[#800020] hover:bg-[#A30D35] text-white transition-all transform hover:scale-105 cursor-pointer shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => triggerSeek(-10, 'rewind')}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => triggerSeek(10, 'forward')}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider & Mute Toggle (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 sm:w-20 accent-rose-600 cursor-pointer h-1 rounded-full bg-white/20"
                />
              </div>

              {/* Time display */}
              <div className="text-[11px] sm:text-xs font-mono-code text-slate-300 pl-1">
                <span className="text-white font-bold">{formatSeconds(currentTime)}</span> / {formatSeconds(duration)}
              </div>

            </div>

            {/* Right Controls: Speed, Ambient Glow Toggle, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Playback Speed Selector */}
              <button
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5, 2];
                  const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                  setPlaybackSpeed(nextSpeed);
                }}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] sm:text-[11px] font-mono-code font-bold text-slate-300 hover:text-white cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Ambient Glow Switch */}
              <button
                onClick={() => setAmbientGlow(!ambientGlow)}
                className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                  ambientGlow ? 'bg-rose-950/80 border-rose-500 text-rose-300' : 'bg-white/10 border-white/10 text-slate-400'
                }`}
                title={ambientGlow ? "Disable Ambient Wall Glow" : "Enable Ambient Wall Glow"}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </div>

          </div>

        </div>

        {/* Quick Episode Drawer Popout */}
        {showEpisodeDrawer && (
          <div className="absolute top-14 right-2 sm:right-4 bottom-20 w-72 sm:w-80 bg-[#121018]/95 border border-rose-900/50 rounded-2xl p-3 sm:p-4 z-40 backdrop-blur-2xl overflow-y-auto space-y-2 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Select Episode
              </span>
              <button onClick={() => setShowEpisodeDrawer(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {show.episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    onSelectEpisode(ep.number);
                    setCurrentTime(0);
                    setShowEpisodeDrawer(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                    ep.number === episodeNumber
                      ? 'bg-gradient-to-r from-rose-950 to-blue-950 border border-rose-500 text-white font-bold'
                      : 'hover:bg-white/[0.06] text-slate-300'
                  }`}
                >
                  <img 
                    src={ep.thumbnailUrl || show.heroPosterUrl} 
                    alt={ep.title} 
                    loading="lazy"
                    className="w-12 h-8 rounded object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      Ep {ep.number}: {ep.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono-code">
                      {ep.duration} • ★ {ep.rating}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Popover Menu */}
        {showSettingsMenu && (
          <div className="absolute top-14 right-2 sm:right-4 w-72 sm:w-80 bg-[#121018]/95 border border-white/15 rounded-2xl p-4 z-40 backdrop-blur-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-rose-400" />
                Audio & Video Config
              </span>
              <button onClick={() => setShowSettingsMenu(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quality Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono-code text-slate-400 uppercase font-bold">Video Resolution</label>
              <select
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="4K Ultra HD (60fps)">4K Ultra HD (60 FPS Master)</option>
                <option value="1080p 60fps HDR">1080p 60 FPS HDR10+</option>
                <option value="720p Mobile Clean">720p Mobile Bandwidth Saver</option>
                <option value="480p Low Power">480p Ultra-Low Battery Saver</option>
              </select>
            </div>

            {/* Audio Track Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono-code text-slate-400 uppercase font-bold">Audio Master Track</label>
              <select
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                {show.audioLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Subtitle Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono-code text-slate-400 uppercase font-bold">Subtitles</label>
                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                    subtitlesEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {subtitlesEnabled ? 'ENABLED' : 'OFF'}
                </button>
              </div>
              {subtitlesEnabled && (
                <select
                  value={subtitleLang}
                  onChange={(e) => setSubtitleLang(e.target.value)}
                  className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white"
                >
                  {show.subtitles.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
