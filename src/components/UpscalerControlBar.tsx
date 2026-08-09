import React from 'react';
import { UpscaleConfig, UpscalerResolver } from '../utils/upscalerResolver';
import { Sparkles } from 'lucide-react';

interface UpscalerControlBarProps {
  currentConfig: UpscaleConfig;
  onSelectPreset: (config: UpscaleConfig) => void;
}

export const UpscalerControlBar: React.FC<UpscalerControlBarProps> = ({
  currentConfig,
  onSelectPreset,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between p-2.5 rounded-2xl bg-[#0d2836] border border-black/80 shadow-[2px_2px_0px_#000000] gap-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#00f2fe] animate-pulse" />
        <span className="text-xs font-black uppercase text-white tracking-wider">
          AI GPU Upscaler & Sharpener
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(UpscalerResolver.PRESETS).map(([key, config]) => {
          const isActive = currentConfig.mode === config.mode;
          return (
            <button
              key={key}
              onClick={() => onSelectPreset(config)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#00f2fe] text-black border-black shadow-[2px_2px_0px_#000000] scale-105'
                  : 'bg-[#07151e] text-[#99f6e4] border-black/60 hover:bg-[#14b8a6]/20'
              }`}
            >
              <span className="capitalize">{key.replace('_', ' ')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
