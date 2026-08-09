export interface PerformanceMetrics {
  currentFps: number;
  isStuttering: boolean;
  isScrolling: boolean;
  degradedModeActive: boolean;
  dropCount: number;
}

export class PerformanceWarden {
  private static fpsQueue: number[] = [];
  private static lastFrameTime = performance.now();
  private static frameCount = 0;
  private static degradedMode = false;
  private static stutterCount = 0;
  private static isScrollingFast = false;
  private static scrollTimeout: any = null;

  // Rate-limiting telemetry & diagnostics to prevent API quota exhaustion
  private static lastDiagnosticTime = 0;
  private static totalDiagnosticsRun = 0;
  private static readonly MAX_DIAGNOSTICS_PER_SESSION = 3;
  private static readonly DIAGNOSTIC_COOLDOWN_MS = 300000; // 5 minutes

  /**
   * Initializes the 60 FPS Telemetry Loop & Scroll Listener
   */
  public static init(): void {
    if (typeof window === 'undefined') return;

    // 1. Monitor Scroll Events for Stutter Prevention
    window.addEventListener(
      'scroll',
      () => {
        this.isScrollingFast = true;
        document.body.classList.add('is-scrolling-fast');

        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.isScrollingFast = false;
          document.body.classList.remove('is-scrolling-fast');
        }, 150);
      },
      { passive: true }
    );

    // 2. Continuous FPS Telemetry Loop
    const measureFps = () => {
      const now = performance.now();
      this.frameCount++;

      if (now - this.lastFrameTime >= 500) {
        // Skip updating FPS metrics if the page is hidden (browser throttles requestAnimationFrame)
        if (typeof document !== 'undefined' && document.hidden) {
          this.frameCount = 0;
          this.lastFrameTime = now;
          requestAnimationFrame(measureFps);
          return;
        }

        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.fpsQueue.push(fps);
        if (this.fpsQueue.length > 10) this.fpsQueue.shift();

        this.frameCount = 0;
        this.lastFrameTime = now;

        // Detect Stutter / Lag Spike (< 45 FPS)
        if (fps < 45) {
          this.stutterCount++;
          this.handleStutterDetected(fps);
        } else if (fps >= 58 && this.degradedMode) {
          // Restore high graphics when stable
          this.restoreHighPerformance();
        }
      }

      requestAnimationFrame(measureFps);
    };

    requestAnimationFrame(measureFps);
  }

  /**
   * Active Stutter Mitigation: Disables costly CSS blurs and reduces particle load
   */
  private static handleStutterDetected(fps: number): void {
    // If hidden, ignore stutter entirely
    if (typeof document !== 'undefined' && document.hidden) return;

    console.warn(`⚡ [Performance Warden] Stutter detected (${fps} FPS)! Applying GPU optimization...`);
    this.degradedMode = true;

    // Add lightweight CSS class to disable heavy backdrop-filter blurs and complex shadows during lag
    document.body.classList.add('low-graphics-mode');

    // If local optimization fails after 3 consecutive stutters, request Gemini AI diagnostic
    if (this.stutterCount >= 3) {
      this.triggerGeminiDiagnostic(fps);
      this.stutterCount = 0;
    }
  }

  private static restoreHighPerformance(): void {
    this.degradedMode = false;
    document.body.classList.remove('low-graphics-mode');
  }

  /**
   * Fallback: Invokes Gemini AI diagnostic API if stutters persist to analyze runtime bottlenecks
   */
  private static async triggerGeminiDiagnostic(lowFps: number): Promise<void> {
    if (typeof document !== 'undefined' && document.hidden) return;

    const now = performance.now();
    if (now - this.lastDiagnosticTime < this.DIAGNOSTIC_COOLDOWN_MS) {
      console.log('🤖 [Performance Warden] Diagnostic on cooldown to prevent API spam.');
      return;
    }

    if (this.totalDiagnosticsRun >= this.MAX_DIAGNOSTICS_PER_SESSION) {
      console.log('🤖 [Performance Warden] Max session diagnostics (3) reached. Standing down.');
      return;
    }

    this.lastDiagnosticTime = now;
    this.totalDiagnosticsRun++;

    try {
      const response = await fetch('/api/performance/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lowFps }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('🤖 [Gemini AI Performance Fixer]:', data.advice);
      } else {
        console.warn('Gemini Performance Fallback response error:', data.error);
      }
    } catch (err) {
      console.warn('Gemini Performance Fallback unavailable:', err);
    }
  }

  public static getMetrics(): PerformanceMetrics {
    const avgFps =
      this.fpsQueue.length > 0
        ? Math.round(this.fpsQueue.reduce((a, b) => a + b, 0) / this.fpsQueue.length)
        : 60;

    return {
      currentFps: avgFps,
      isStuttering: avgFps < 50,
      isScrolling: this.isScrollingFast,
      degradedModeActive: this.degradedMode,
      dropCount: this.stutterCount,
    };
  }
}
