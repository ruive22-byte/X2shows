import React, { useState } from 'react';
import { AspectRatioMode, ShimmerSpeed } from '../types';
import { SlidersHorizontal, RefreshCw, Grid, LayoutGrid, Check, Smile, Zap } from 'lucide-react';

interface ShellControlsFloatingProps {
  aspectRatio: AspectRatioMode;
  onToggleAspectRatio: (ratio: AspectRatioMode) => void;
  shimmerSpeed: ShimmerSpeed;
  onChangeShimmerSpeed: (speed: ShimmerSpeed) => void;
  onSimulateRefresh: () => void;
  onReplayIntro: () => void;
  onOpenDualApiModal?: () => void;
  onShowToast: (msg: string) => void;
}

export const ShellControlsFloating: React.FC<ShellControlsFloatingProps> = ({
  aspectRatio,
  onToggleAspectRatio,
  shimmerSpeed,
  onChangeShimmerSpeed,
  onSimulateRefresh,
  onReplayIntro,
  onOpenDualApiModal,
  onShowToast
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 font-cartoon">
      {isOpen ? (
        <div className="p-4 rounded-3xl bg-[#07151e] border-[3px] border-black shadow-[6px_6px_0px_#000000] space-y-3 w-76 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-[#00f2fe]" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                TOON SHELL CONTROLS
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#99f6e4] hover:text-white p-1 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Dual API Fallback Status & Cache Button */}
          {onOpenDualApiModal && (
            <button
              onClick={() => {
                onOpenDualApiModal();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] hover:from-[#00f2fe] hover:to-[#38bdf8] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-black stroke-black" />
                <span>Dual API & TVmaze Engine</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            </button>
          )}

          {/* Aspect Ratio Mode */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-[#99f6e4] font-black">Poster & Cinema Mode</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleAspectRatio('2:3');
                  onShowToast('Set 2:3 Toon Poster Ratio');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] ${
                  aspectRatio === '2:3'
                    ? 'bg-[#14b8a6] text-black'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>2:3 Poster</span>
              </button>

              <button
                onClick={() => {
                  onToggleAspectRatio('16:9');
                  onShowToast('Set 16:9 Cinema Ratio');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] ${
                  aspectRatio === '16:9'
                    ? 'bg-[#38bdf8] text-black'
                    : 'bg-[#0d2836] text-[#ccfbf1] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>16:9 Cinema</span>
              </button>
            </div>
          </div>

          {/* Replay 4s Cinematic Intro */}
          <button
            onClick={() => {
              onReplayIntro();
              setIsOpen(false);
              onShowToast('Replaying 4-Second Cyber-Teal Cinematic Splash Intro...');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-[#00f2fe] hover:bg-[#38bdf8] border-2 border-black text-xs font-black text-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>Replay 4s Cinematic Intro</span>
          </button>

          {/* Refresh / Re-shimmer */}
          <button
            onClick={() => {
              onSimulateRefresh();
              onShowToast('Re-rendering Teal & Light Blue Shimmer State...');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-[#0d2836] hover:bg-[#14b8a6] hover:text-black border-2 border-black text-xs font-black text-[#ccfbf1] transition-all cursor-pointer shadow-[2px_2px_0px_#000000] transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Re-Shimmer Skeleton</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 rounded-full bg-gradient-to-tr from-[#14b8a6] to-[#38bdf8] hover:from-[#00f2fe] hover:to-[#38bdf8] text-black border-[2.5px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-all transform hover:scale-110 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          title="Open Cartoon Shell Controls"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
