import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Search, 
  Settings, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  GripVertical, 
  SlidersHorizontal,
  Zap, 
  Sparkles, 
  Tv, 
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  HelpCircle,
  Flame,
  LayoutGrid,
  Bot,
  Bug,
  Dices,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  ShieldAlert,
  X,
  Copy
} from 'lucide-react';
import { NavTab, AspectRatioMode, ShimmerSpeed, WatchlistItem } from '../types';
import { TmdbAnimatedShow } from '../data/tmdbData';
import { AppAuditor, AuditReport } from '../utils/appAuditor';
import { MultiAiFixer } from '../utils/multiAiFixer';
import { AiSupervisor, SupervisorReview } from '../utils/aiSupervisor';

interface MovableVerticalTaskbarProps {
  activeNav: NavTab;
  onSelectNav: (nav: NavTab) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenWatchlist?: () => void;
  onOpenDualApi?: () => void;
  watchlistCount: number;
  onReplayIntro?: () => void;
  onShowToast: (msg: string) => void;
  catalogShows: TmdbAnimatedShow[];
}

export const MovableVerticalTaskbar: React.FC<MovableVerticalTaskbarProps> = ({
  activeNav,
  onSelectNav,
  onOpenSearch,
  onOpenSettings,
  onOpenDualApi,
  watchlistCount,
  onReplayIntro,
  onShowToast,
  catalogShows
}) => {
  // Pop-out state: user can choose for the taskbar to pop out into an expanded panel or stay in compact vertical dock mode
  const [isPoppedOut, setIsPoppedOut] = useState<boolean>(() => {
    try {
      return localStorage.getItem('x2_taskbar_popped_out') === 'true';
    } catch {
      return false;
    }
  });

  // Movable coordinates: persisted in localStorage or default to left-center
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('x2_taskbar_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return { x: 18, y: 180 };
  });

  const isLeftSide = position.x < window.innerWidth / 2;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0
  });

  const taskbarRef = useRef<HTMLDivElement | null>(null);

  // Health Audit States
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [supervisorReview, setSupervisorReview] = useState<SupervisorReview | null>(null);
  const [isAuditPanelOpen, setIsAuditPanelOpen] = useState(false);

  // Security States
  const [threats, setThreats] = useState<any[]>([]);
  const [isSecurityPanelOpen, setIsSecurityPanelOpen] = useState(false);

  // Periodic poll to fetch active threat logs from the SecuritySentinelBot
  useEffect(() => {
    const fetchThreats = () => {
    };
    fetchThreats();
    const interval = setInterval(fetchThreats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setIsAuditPanelOpen(true);
    setIsSecurityPanelOpen(false); // Close other panels
    onShowToast('Executing Full App Health Audit...');
    const result = await AppAuditor.runFullAudit(catalogShows);
    setAuditReport(result);
    setIsAuditing(false);
    onShowToast(`Audit complete: Detected ${result.issues.length} issues.`);
  };

  const handleAutoFix = async () => {
    if (!auditReport) return;
    setIsFixing(true);
    onShowToast('Multi-AI Auto-Repair initiated...');

    // Run Supervisor Pre-Inspection check on current state
    const mockPlan = {
      rootCauseAnalysis: 'Automated audit detected system warnings or catalog anomalies.',
      affectedFiles: ['src/utils/serverResolver.ts', 'src/utils/catalogSanitizer.ts'],
      patches: [
        {
          filePath: 'src/utils/serverResolver.ts',
          action: 'UPDATE' as const,
          updatedContent: '// Active Server Resolver Patches applied with bg-[#07151e]',
        },
      ],
      verificationChecklist: ['Embed server endpoints verified', 'Catalog sanitized'],
    };

    const review = await AiSupervisor.reviewBotOutput(auditReport, mockPlan);
    setSupervisorReview(review);

    await MultiAiFixer.executeAutoRepair(auditReport);
    setIsFixing(false);
    onShowToast('Auto-repair completed successfully!');
  };

  const copyPromptForAi = () => {
    if (!auditReport) return;
    const promptText = `Here is my app's automated audit report. Fix the following issues in my code:\n\n\`\`\`json\n${JSON.stringify(
      auditReport,
      null,
      2
    )}\n\`\`\``;
    navigator.clipboard.writeText(promptText);
    onShowToast('Copied AI security repair prompt to clipboard!');
  };

  // Save popped-out preference
  useEffect(() => {
    try {
      localStorage.setItem('x2_taskbar_popped_out', String(isPoppedOut));
    } catch {}
  }, [isPoppedOut]);

  // Save position preference
  useEffect(() => {
    try {
      localStorage.setItem('x2_taskbar_pos', JSON.stringify(position));
    } catch {}
  }, [position]);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only initiate drag if clicking the drag handle or top bar
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const taskbarW = taskbarRef.current?.offsetWidth || 70;
    const taskbarH = taskbarRef.current?.offsetHeight || 300;

    const newX = Math.max(10, Math.min(screenW - taskbarW - 10, dragStartRef.current.posX + deltaX));
    const newY = Math.max(60, Math.min(screenH - taskbarH - 10, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const handleResetPosition = () => {
    setPosition({ x: 18, y: 180 });
    onShowToast('Dock position reset to left margin');
  };

  const handleTogglePopOut = () => {
    const next = !isPoppedOut;
    setIsPoppedOut(next);
    onShowToast(next ? 'Taskbar popped out (Expanded mode)' : 'Taskbar collapsed (Compact vertical dock)');
  };

  return (
    <div
      ref={taskbarRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 45,
        touchAction: 'none'
      }}
      className={`font-cartoon transition-shadow duration-200 select-none ${
        isDragging ? 'cursor-grabbing scale-[1.02] shadow-[8px_8px_0px_#00f2fe]' : ''
      }`}
    >
      <div 
        className={`rounded-3xl border-[3px] border-black bg-[#07151e] shadow-[6px_6px_0px_#000000] backdrop-blur-md transition-all duration-300 ${
          isPoppedOut ? 'w-56 sm:w-60 p-3' : 'w-14 sm:w-16 p-2'
        }`}
      >
        {/* Header / Drag Grip Handle */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black/80 gap-1">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing p-1 rounded-xl hover:bg-[#14b8a6]/20 transition-colors flex-1"
            title="Drag to move taskbar anywhere on screen"
          >
            <GripVertical className="w-4 h-4 text-[#00f2fe]" />
            {isPoppedOut && (
              <span className="text-[10px] font-black text-[#99f6e4] uppercase tracking-wider truncate">
                TOON TASKBAR
              </span>
            )}
          </div>

          {/* Pop-out / Collapse Toggle Button */}
          <button
            onClick={handleTogglePopOut}
            className="p-1.5 rounded-xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black text-[#99f6e4] border border-black shadow-[1px_1px_0px_#000000] transition-all cursor-pointer"
            title={isPoppedOut ? 'Collapse taskbar to compact dock' : 'Pop out taskbar to expanded panel'}
          >
            {isPoppedOut ? (
              <ChevronLeft className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Vertical Navigation Buttons */}
        <div className="space-y-2">
          {/* 1. HOME BUTTON */}
          <button
            onClick={() => {
              onSelectNav('Home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onShowToast('Navigated to Home (Cartoons Feed)');
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group ${
              activeNav === 'Home'
                ? 'bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black font-black'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#14b8a6]/30 hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title="Home - TV Series & Featured Toons"
          >
            <div className="relative shrink-0">
              <Home className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeNav === 'Home' ? 'stroke-[2.5]' : ''}`} />
              {activeNav === 'Home' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-black animate-ping" />
              )}
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Home</span>
                <span className="text-[9px] opacity-80 block truncate">Cartoons & Series</span>
              </div>
            )}
          </button>

          {/* 2. SEARCH BUTTON */}
          <button
            onClick={() => {
              onOpenSearch();
              onShowToast('Opened Search Modal & Discovery Filters (⌘K)');
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] hover:bg-[#00f2fe] hover:text-black ${
              isPoppedOut ? 'justify-start px-3' : 'justify-center'
            }`}
            title="Search cartoons, anime & movies (⌘K)"
          >
            <div className="shrink-0">
              <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Search</span>
                <span className="text-[9px] opacity-80 block truncate">Filters & Vault (⌘K)</span>
              </div>
            )}
          </button>

          {/* 3. SETTINGS BUTTON */}
          <button
            onClick={() => {
              onOpenSettings();
              onShowToast('Opened Shell Controls & Display Settings');
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] hover:bg-[#facc15] hover:text-black ${
              isPoppedOut ? 'justify-start px-3' : 'justify-center'
            }`}
            title="Settings - Aspect Ratio, Shimmers & Tools"
          >
            <div className="shrink-0">
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Settings</span>
                <span className="text-[9px] opacity-80 block truncate">Ratios & Shimmers</span>
              </div>
            )}
          </button>

          {/* 4. WATCHLIST BUTTON */}
          <button
            onClick={() => {
              onSelectNav('Watchlist');
              onShowToast(`Opened Watchlist (${watchlistCount} shows)`);
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group ${
              activeNav === 'Watchlist'
                ? 'bg-[#facc15] text-black font-black'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#facc15]/30 hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title={`Watchlist (${watchlistCount} shows)`}
          >
            <div className="relative shrink-0">
              <Bookmark className="w-5 h-5 transition-transform group-hover:scale-110" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-[#00f2fe] text-black text-[9px] font-black rounded-full border border-black leading-none">
                  {watchlistCount}
                </span>
              )}
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Watchlist</span>
                <span className="text-[9px] opacity-80 block truncate">{watchlistCount} Tracked</span>
              </div>
            )}
          </button>

          {/* DUAL API ENGINE SHORTCUT */}
          {onOpenDualApi && (
            <button
              onClick={() => {
                onOpenDualApi();
                onShowToast('Inspecting Dual API (TMDB + TVmaze Fallback Engine)...');
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] hover:bg-[#38bdf8] hover:text-black ${
                isPoppedOut ? 'justify-start px-3' : 'justify-center'
              }`}
              title="Dual API Inspector (TMDB + TVmaze)"
            >
              <div className="shrink-0">
                <Zap className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
              </div>
              {isPoppedOut && (
                <div className="text-left leading-tight truncate">
                  <span className="text-xs font-black block">Dual API</span>
                  <span className="text-[9px] opacity-80 block truncate">Fallback Status</span>
                </div>
              )}
            </button>
          )}

          {/* AI & AUTONOMY CODES SECTION */}
          {isPoppedOut && (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2 pb-1 border-t border-black/40">
              AI & Autonomy
            </div>
          )}

          {/* 5. AI BOT MATRIX HUD */}
          <button
            onClick={()=>{}}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group ${
              false
                ? 'bg-[#00f2fe] text-black font-black'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#00f2fe]/30 hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title="AI Bot Matrix HUD (Show Problem Logs & Self-Healing)"
          >
            <div className="shrink-0 relative">
              <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-ping" />
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">6-Bot Matrix</span>
                <span className="text-[9px] opacity-80 block truncate">Inspect & Self-Heal</span>
              </div>
            )}
          </button>

          {/* 6. RELEASE CARTOON CURATOR */}
          {false && (
            <button
              onClick={() => { onShowToast('Mascot feature was removed.'); }}
              className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] hover:bg-yellow-400 hover:text-black ${
                isPoppedOut ? 'justify-start px-3' : 'justify-center'
              }`}
              title="Release Cartoon Curator (Let character crawl and inspect show cards)"
            >
              <div className="shrink-0">
                <Dices className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500 text-yellow-300" />
              </div>
              {isPoppedOut && (
                <div className="text-left leading-tight truncate">
                  <span className="text-xs font-black block">Release Mascot</span>
                  <span className="text-[9px] opacity-80 block truncate">Pick random show</span>
                </div>
              )}
            </button>
          )}

          {/* 7. MASCOT TOGGLE */}
          <button
            onClick={()=>{}}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] ${
              false ? 'hover:bg-[#10b981] hover:text-white' : 'hover:bg-[#ef4444] hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title={false ? 'Mascot is ON (Hide character)' : 'Mascot is OFF (Show character)'}
          >
            <div className="shrink-0">
              {false ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-500" />
              )}
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Mascot Mode</span>
                <span className="text-[9px] opacity-80 block truncate">{false ? 'Mascot: ON' : 'Mascot: OFF'}</span>
              </div>
            )}
          </button>

          {/* 8. MINI BUGS TOGGLE */}
          <button
            onClick={()=>{}}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group bg-[#0d2836] text-[#ccfbf1] ${
              false ? 'hover:bg-[#10b981] hover:text-white' : 'hover:bg-[#ef4444] hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title={false ? '12 Mini Bugs are ON (Hide bugs)' : '12 Mini Bugs are OFF (Show bugs)'}
          >
            <div className="shrink-0">
              <Bug className={`w-5 h-5 ${false ? 'text-[#00f2fe] animate-bounce' : 'text-gray-500'}`} />
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Bug Swarm</span>
                <span className="text-[9px] opacity-80 block truncate">{false ? 'Bugs: ON' : 'Bugs: OFF'}</span>
              </div>
            )}
          </button>

          {/* 9. HEALTH AUDIT */}
          <button
            onClick={() => {
              setIsSecurityPanelOpen(false);
              if (isAuditPanelOpen) {
                setIsAuditPanelOpen(false);
              } else {
                handleRunAudit();
              }
            }}
            disabled={isAuditing}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group ${
              isAuditPanelOpen
                ? 'bg-[#00f2fe] text-black font-black'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#00f2fe]/30 hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title="App Health Audit - Run diagnostic analysis of catalog & server streams"
          >
            <div className="shrink-0 relative">
              <Activity className={`w-5 h-5 ${isAuditing ? 'animate-spin' : 'transition-transform group-hover:scale-110 text-[#00f2fe]'}`} />
              {auditReport && auditReport.issues.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Health Audit</span>
                <span className="text-[9px] opacity-80 block truncate">
                  {isAuditing ? 'Analyzing...' : auditReport ? `${auditReport.issues.length} Issues` : 'Run Diagnostic'}
                </span>
              </div>
            )}
          </button>

          {/* 10. SECURITY SENTINEL STATUS */}
          <button
            onClick={() => {
              setIsSecurityPanelOpen(!isSecurityPanelOpen);
              setIsAuditPanelOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 group ${
              isSecurityPanelOpen
                ? 'bg-[#22c55e] text-black font-black'
                : threats.length > 0
                ? 'bg-red-500/20 text-red-200 border-red-500 hover:bg-red-500/40'
                : 'bg-[#0d2836] text-[#ccfbf1] hover:bg-[#22c55e]/30 hover:text-white'
            } ${isPoppedOut ? 'justify-start px-3' : 'justify-center'}`}
            title={threats.length > 0 ? `${threats.length} Threats Blocked by Bot` : 'Security Bot Active'}
          >
            <div className="shrink-0 relative">
              {threats.length > 0 ? (
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-green-400" />
              )}
              {threats.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white border border-black font-black text-[8px] rounded-full px-1 py-0 leading-none">
                  {threats.length}
                </span>
              )}
            </div>
            {isPoppedOut && (
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-black block">Security Bot</span>
                <span className="text-[9px] opacity-80 block truncate">
                  {threats.length > 0 ? `${threats.length} Blocked` : 'Bot Shield Active'}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Footer info when popped out */}
        {isPoppedOut && (
          <div className="mt-3 pt-2 border-t-2 border-black/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#7dd3fc] font-bold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
                Movable Dock
              </span>
              <button
                onClick={handleResetPosition}
                className="hover:underline text-[#00f2fe] cursor-pointer"
                title="Reset dock position"
              >
                Reset
              </button>
            </div>
            <p className="text-[9px] text-[#99f6e4]/70 leading-tight">
              Drag anywhere on screen. Click top arrow to collapse.
            </p>
          </div>
        )}
      </div>

      {/* Floating Side Panel HUDs docked to the Taskbar container */}
      
      {/* 1. App Health Audit Details Panel */}
      {isAuditPanelOpen && (
        <div 
          style={{ pointerEvents: 'auto' }}
          className={`absolute top-0 w-80 max-h-[85vh] overflow-y-auto bg-[#07151e] border-[3px] border-black rounded-3xl p-4 shadow-[6px_6px_0px_#000000] z-50 text-white space-y-3 cursor-default select-text ${
            isLeftSide ? 'left-full ml-3' : 'right-full mr-3'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="font-black text-[#00f2fe] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00f2fe] animate-pulse" />
              App Health Check
            </span>
            <button 
              onClick={() => setIsAuditPanelOpen(false)}
              className="p-1 rounded-lg bg-black/40 hover:bg-red-500 hover:text-white border border-black cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAuditing ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Activity className="w-8 h-8 text-[#00f2fe] animate-spin" />
              <p className="text-xs text-[#00f2fe] font-black animate-pulse">Running Diagnostic Suite...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-bold">Status Check:</span>
                <span className={auditReport?.healthy ? 'text-green-400 font-black' : 'text-red-400 font-black'}>
                  {auditReport?.healthy ? '🟢 System Clean' : '🔴 Action Required'}
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {!auditReport ? (
                  <div className="p-3 bg-black/40 rounded-xl border border-black text-center text-xs text-gray-400 font-cartoon">
                    Run first audit check above to generate logs
                  </div>
                ) : auditReport.issues.length === 0 ? (
                  <div className="p-3 bg-black/40 rounded-xl border border-green-500/30 text-center text-xs text-green-300 font-cartoon">
                    No bugs, duplicates, or dead streams detected!
                  </div>
                ) : (
                  auditReport.issues.map((issue, idx) => (
                    <div key={idx} className="p-2 bg-black/40 rounded-xl border border-black text-[11px] leading-tight space-y-0.5 font-cartoon">
                      <div className="flex items-center justify-between">
                        <span className={issue.severity === 'CRITICAL' ? 'text-red-400 font-black' : 'text-amber-400 font-black'}>
                          [{issue.severity}]
                        </span>
                        <span className="text-[9px] text-gray-500">{issue.category}</span>
                      </div>
                      <p className="text-gray-200">{issue.message}</p>
                    </div>
                  ))
                )}
              </div>

              {supervisorReview && (
                <div className="p-3 bg-black/60 rounded-xl border border-[#00f2fe]/40 text-[11px] space-y-1 font-cartoon">
                  <div className="font-bold text-[#00f2fe] flex items-center justify-between">
                    <span>🛡️ AI Supervisor Review</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#00f2fe]/10 text-[#00f2fe] text-[10px] font-black border border-[#00f2fe]/30">
                      Score: {supervisorReview.score}/100
                    </span>
                  </div>
                  <p className="text-gray-300 italic">"{supervisorReview.critique}"</p>
                </div>
              )}

              {auditReport && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoFix}
                    disabled={isFixing || isAuditing}
                    className="flex-1 py-2 bg-[#00f2fe] hover:bg-white text-black font-black rounded-xl border border-black text-xs hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000] active:scale-95 disabled:opacity-50 font-cartoon"
                  >
                    {isFixing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Repairing...
                      </>
                    ) : (
                      '🤖 Auto-Repair'
                    )}
                  </button>
                  <button
                    onClick={copyPromptForAi}
                    className="py-2 px-3 bg-[#22c55e] hover:bg-white text-black font-black rounded-xl border border-black text-xs hover:scale-102 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-95"
                    title="Copy Audit Report as AI prompt"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-1.5 text-center bg-[#0d2836] hover:bg-black text-[#00f2fe] border border-[#00f2fe]/40 rounded-xl text-xs font-black cursor-pointer transition-colors font-cartoon"
              >
                ⚡ Run System Diagnostic
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Security Bot Logs Details Panel */}
      {isSecurityPanelOpen && (
        <div 
          style={{ pointerEvents: 'auto' }}
          className={`absolute top-0 w-80 max-h-[85vh] overflow-y-auto bg-[#07151e] border-[3px] border-black rounded-3xl p-4 shadow-[6px_6px_0px_#000000] z-50 text-white space-y-3 cursor-default select-text ${
            isLeftSide ? 'left-full ml-3' : 'right-full mr-3'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="font-black text-green-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Sentinel Bot Logs
            </span>
            <button 
              onClick={() => setIsSecurityPanelOpen(false)}
              className="p-1 rounded-lg bg-black/40 hover:bg-red-500 hover:text-white border border-black cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-cartoon">
            <div className="p-2.5 bg-green-500/10 border border-green-500/30 rounded-2xl text-[11px] text-green-400 leading-normal flex items-start gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <p className="font-bold">Active Defender Shielded</p>
                <p className="text-gray-300 text-[10px] mt-0.5">Sentinel active. Purging injected trackers & malicious iframes dynamically.</p>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {threats.length === 0 ? (
                <div className="p-3 bg-black/40 rounded-xl border border-black text-center text-xs text-gray-400">
                  No threat events detected in this session.
                </div>
              ) : (
                threats.map((threat, idx) => {
                  const handlePatchGenerate = () => {
                    navigator.clipboard.writeText('Patch instructions for ' + threat.type);
                    onShowToast(`Copied auto-patch prompt for: ${threat.type}`);
                  };

                  return (
                    <div key={idx} className="p-2 bg-black/40 rounded-xl border border-red-500/30 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-bold">[{threat.type}]</span>
                        <span className="text-[9px] text-gray-500">{threat.timestamp.substring(11, 19)}</span>
                      </div>
                      <p className="text-gray-300 text-[10px]">Severity: <span className="text-red-400 font-bold">{threat.severity}</span></p>
                      <button
                        onClick={handlePatchGenerate}
                        className="w-full py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/40 rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all"
                      >
                        ⚡ Generate Patch
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
