// src/utils/perfWorker.ts

export interface DiagnosticPayload {
  fpsHistory: number[];
  domNodeCount: number;
  jsHeapUsedMB?: number;
  activeTimersCount: number;
  componentRenderCounts?: Record<string, number>;
}

export interface PerfMetricsReport {
  avgFps: number;
  fpsVariance: number;
  stutterSeverity: 'NONE' | 'LOW' | 'CRITICAL';
  memoryPressureRatio: number;
  domOverheadScore: number;
  bottleneckType: 'GPU_COMPOSITING' | 'MAIN_THREAD_BLOCK' | 'DOM_BLOAT' | 'NONE';
  hotComponents: string[];
  timestamp: number;
}

self.onmessage = (event: MessageEvent<DiagnosticPayload>) => {
  const { fpsHistory, domNodeCount, jsHeapUsedMB, activeTimersCount, componentRenderCounts = {} } = event.data;

  // 1. Calculate Mean & Variance for Frame Rates
  const sum = fpsHistory.reduce((a, b) => a + b, 0);
  const avgFps = fpsHistory.length > 0 ? sum / fpsHistory.length : 60;
  const variance = fpsHistory.reduce((a, b) => a + Math.pow(b - avgFps, 2), 0) / (fpsHistory.length || 1);

  // 2. Compute Stutter Severity
  let stutterSeverity: 'NONE' | 'LOW' | 'CRITICAL' = 'NONE';
  if (avgFps < 30 || variance > 120) {
    stutterSeverity = 'CRITICAL';
  } else if (avgFps < 50 || variance > 40) {
    stutterSeverity = 'LOW';
  }

  // 3. Evaluate DOM & Memory Overhead
  const domOverheadScore = Math.min(100, Math.round((domNodeCount / 1500) * 100));
  const heapEstimate = jsHeapUsedMB || 50;
  const memoryPressureRatio = Math.min(1, Math.round((heapEstimate / 200) * 100) / 100);

  // 4. Identify Hot Components (Render frequency spikes)
  const hotComponents = Object.entries(componentRenderCounts)
    .filter(([_, count]) => count > 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count}x)`);

  // 5. Determine Primary Bottleneck
  let bottleneckType: 'GPU_COMPOSITING' | 'MAIN_THREAD_BLOCK' | 'DOM_BLOAT' | 'NONE' = 'NONE';
  if (domNodeCount > 1800) {
    bottleneckType = 'DOM_BLOAT';
  } else if (stutterSeverity === 'CRITICAL' && activeTimersCount > 5) {
    bottleneckType = 'MAIN_THREAD_BLOCK';
  } else if (variance > 80) {
    bottleneckType = 'GPU_COMPOSITING';
  }

  const report: PerfMetricsReport = {
    avgFps: Math.round(avgFps * 10) / 10,
    fpsVariance: Math.round(variance * 10) / 10,
    stutterSeverity,
    memoryPressureRatio,
    domOverheadScore,
    bottleneckType,
    hotComponents,
    timestamp: Date.now(),
  };

  self.postMessage(report);
};
