export class DpiScaler {
  /**
   * Detects display DPI and returns optimal image resolution suffix.
   */
  public static getOptimalImageSize(): 'w500' | 'w780' | 'original' {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth * dpr : 1920;

    if (screenWidth >= 3840 || dpr >= 2) return 'original';
    if (screenWidth >= 1920) return 'w780';
    return 'w500';
  }

  /**
   * Returns optimal iframe rendering parameters based on user display resolution.
   */
  public static getStreamResolutionParams(): string {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return dpr >= 2 ? '&res=4k&fps=60' : '&res=1080p';
  }
}
