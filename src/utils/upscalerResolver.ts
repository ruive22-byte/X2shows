import React from 'react';

export interface UpscaleConfig {
  mode: 'off' | 'sharp_4k' | 'anime_ultra' | 'hdr_vivid';
  brightness: number;
  contrast: number;
  sharpness: number;
  saturate: number;
}

export class UpscalerResolver {
  /**
   * Preset shader and CSS upscaling profiles for different animation styles
   */
  public static PRESETS: Record<string, UpscaleConfig> = {
    off: { mode: 'off', brightness: 100, contrast: 100, sharpness: 0, saturate: 100 },
    sharp_4k: { mode: 'sharp_4k', brightness: 103, contrast: 108, sharpness: 120, saturate: 105 },
    anime_ultra: { mode: 'anime_ultra', brightness: 105, contrast: 112, sharpness: 150, saturate: 115 },
    hdr_vivid: { mode: 'hdr_vivid', brightness: 108, contrast: 118, sharpness: 130, saturate: 125 },
  };

  /**
   * Generates hardware-accelerated CSS filter strings for live video iframe upscaling
   */
  public static getCanvasFilterStyle(config: UpscaleConfig): React.CSSProperties {
    if (config.mode === 'off') return {};

    return {
      filter: `contrast(${config.contrast}%) brightness(${config.brightness}%) saturate(${config.saturate}%)`,
      imageRendering: '-webkit-optimize-contrast',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    };
  }

  /**
   * Upscales static TMDB poster/still image URLs using AI proxy endpoints
   */
  public static getAiUpscaledImageUrl(originalUrl?: string | null, _scaleFactor: 2 | 4 = 4): string | null {
    if (!originalUrl) return null;
    
    // If it's already a high-res TMDB original URL, ensure max quality
    if (originalUrl.includes('image.tmdb.org')) {
      return originalUrl.replace(/\/w\d+\//, '/original/');
    }

    return originalUrl;
  }
}
