// src/workers/telemetryWorker.ts

export interface DiagnosticInput {
  fpsHistory: number[];
  domNodeCount: number;
  jsHeapUsedMB?: number;
  activeTimers: number;
}

export interface TelemetryReport {
  meanFps: number;
  fpsVariance: number;
  stutterSeverity: 'NONE' | 'LOW' | 'CRITICAL';
  memoryPressureRatio: number;
  domOverheadScore: number;
  bottleneckType: 'GPU_COMPOSITING' | 'MAIN_THREAD_BLOCK' | 'DOM_BLOAT' | 'NONE';
}

self.onmessage = (event: MessageEvent<DiagnosticInput>) => {
  const { fpsHistory, domNodeCount, jsHeapUsedMB, activeTimers } = event.data;

  // 1. Calculate Mean & Variance
  const sum = fpsHistory.reduce((acc, val) => acc + val, 0);
  const meanFps = fpsHistory.length > 0 ? sum / fpsHistory.length : 60;
  const variance =
    fpsHistory.reduce((acc, val) => acc + Math.pow(val - meanFps, 2), 0) / (fpsHistory.length || 1);

  // 2. Assess Severity
  let stutterSeverity: 'NONE' | 'LOW' | 'CRITICAL' = 'NONE';
  if (meanFps < 30 || variance > 120) {
    stutterSeverity = 'CRITICAL';
  } else if (meanFps < 50 || variance > 40) {
    stutterSeverity = 'LOW';
  }

  // 3. Evaluate Overhead
  const domOverheadScore = Math.min(100, Math.round((domNodeCount / 1500) * 100));
  const heapEstimate = jsHeapUsedMB || 50;
  const memoryPressureRatio = Math.min(1, Math.round((heapEstimate / 200) * 100) / 100);

  // 4. Identify Primary Bottleneck
  let bottleneckType: 'GPU_COMPOSITING' | 'MAIN_THREAD_BLOCK' | 'DOM_BLOAT' | 'NONE' = 'NONE';
  if (domNodeCount > 1800) {
    bottleneckType = 'DOM_BLOAT';
  } else if (stutterSeverity === 'CRITICAL' && activeTimers > 5) {
    bottleneckType = 'MAIN_THREAD_BLOCK';
  } else if (variance > 80) {
    bottleneckType = 'GPU_COMPOSITING';
  }

  const report: TelemetryReport = {
    meanFps: Math.round(meanFps * 10) / 10,
    fpsVariance: Math.round(variance * 10) / 10,
    stutterSeverity,
    memoryPressureRatio,
    domOverheadScore,
    bottleneckType,
  };

  self.postMessage(report);
};
