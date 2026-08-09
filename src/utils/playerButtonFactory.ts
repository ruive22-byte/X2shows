import React from 'react';

export interface PlayerButtonConfig {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  color?: 'cyan' | 'green' | 'amber' | 'dark';
  onClick: () => void;
}

export class PlayerButtonFactory {
  private static COLOR_STYLES = {
    cyan: 'bg-[#00f2fe] text-black border-black hover:bg-[#38bdf8]',
    green: 'bg-[#22c55e] text-black border-black hover:bg-[#4ade80]',
    amber: 'bg-[#f59e0b] text-black border-black hover:bg-[#fbbf24]',
    dark: 'bg-[#07151e] text-[#99f6e4] border-black hover:bg-[#0d2836]',
  };

  /**
   * Generates a fully-styled, standardized action pill button in 1 line
   */
  public static createButton(config: PlayerButtonConfig): React.ReactElement {
    const styleClass = this.COLOR_STYLES[config.color || 'cyan'];
    
    return React.createElement(
      'button',
      {
        key: config.id,
        onClick: config.onClick,
        className: `px-3 py-1.5 rounded-xl font-black text-xs border-2 shadow-[2px_2px_0px_#000000] cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 ${
          config.active ? 'ring-2 ring-white scale-105' : ''
        } ${styleClass}`,
      },
      config.icon ? `${config.icon} ${config.label}` : config.label
    );
  }
}
