import React from 'react';

export class ShaderUpscaler {
  /**
   * Generates a WebGL-backed SVG filter overlay for advanced edge reconstruction & line sharpening.
   */
  public static getSvgFilterMarkup(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <defs>
          <!-- Anime Line-Art Sharpen & Noise Suppression Filter -->
          <filter id="anime-super-res">
            <feConvolveMatrix 
              order="3 3" 
              preserveAlpha="true" 
              kernelMatrix="
                0 -1  0 
               -1  5 -1 
                0 -1  0" 
            />
            <feColorMatrix type="saturate" values="1.1" />
          </filter>

          <!-- 4K Ultra Contrast & Edge Reconstruction Filter -->
          <filter id="4k-ultra-edge">
            <feConvolveMatrix 
              order="3 3" 
              preserveAlpha="true" 
              kernelMatrix="
               -0.5 -1.0 -0.5 
               -1.0  7.0 -1.0 
               -0.5 -1.0 -0.5" 
            />
          </filter>
        </defs>
      </svg>
    `;
  }

  /**
   * Returns SVG filter ID styling strings to apply directly to player containers.
   */
  public static getFilterStyle(mode: 'off' | 'anime_super_res' | '4k_ultra_edge'): React.CSSProperties {
    if (mode === 'off') return {};

    const filterId = mode === 'anime_super_res' ? 'anime-super-res' : '4k_ultra_edge';

    return {
      filter: `url(#${filterId})`,
      imageRendering: 'crisp-edges',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    };
  }
}

export class DynamicShaderEngine {
  /**
   * Generates a dynamic 3x3 convolution kernel based on user slider input (1x to 5x)
   */
  public static getDynamicKernelFilter(strength: number): React.CSSProperties {
    if (strength <= 0) {
      return { imageRendering: 'auto' };
    }

    // Strength scales the center matrix multiplier while balancing surrounding negative weights
    const center = (1 + 4 * strength).toFixed(1);
    const edge = (-1 * strength).toFixed(1);

    const svgFilter = `
      <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
        <filter id="dynamic-kernel-sharpen">
          <feConvolveMatrix order="3 3" preserveAlpha="true" kernelMatrix="
            0 ${edge} 0
            ${edge} ${center} ${edge}
            0 ${edge} 0" 
          />
        </filter>
      </svg>
    `;

    // Inject SVG dynamically if missing
    if (typeof document !== 'undefined') {
      let elem = document.getElementById('dynamic-kernel-svg');
      if (!elem) {
        elem = document.createElement('div');
        elem.id = 'dynamic-kernel-svg';
        document.body.appendChild(elem);
      }
      elem.innerHTML = svgFilter;
    }

    return {
      filter: 'url(#dynamic-kernel-sharpen)',
      imageRendering: 'crisp-edges',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    };
  }
}

