// src/hooks/useTelemetryWorker.ts
import { useEffect, useRef, useState } from 'react';
import { DiagnosticInput, TelemetryReport } from '../workers/telemetryWorker';

export function useTelemetryWorker(isModalOpen: boolean) {
  const [metrics, setMetrics] = useState<TelemetryReport | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const fpsWindowRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!isModalOpen) return;

    // 1. Instantiate the worker dynamically
    try {
      workerRef.current = new Worker(
        new URL('../workers/telemetryWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // 2. Listen for off-thread telemetry updates
      workerRef.current.onmessage = (e: MessageEvent<TelemetryReport>) => {
        setMetrics(e.data);
      };
    } catch (e) {
      console.warn('Worker initialization fallback:', e);
    }

    // 3. Measure frame rates on the main thread
    let animFrameId: number;
    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const currentFps = Math.min(60, Math.round(1000 / (delta || 16.6)));
      fpsWindowRef.current.push(currentFps);

      if (fpsWindowRef.current.length > 30) {
        fpsWindowRef.current.shift();
      }

      animFrameId = requestAnimationFrame(measureFps);
    };

    animFrameId = requestAnimationFrame(measureFps);

    // 4. Sample metrics to worker or fallback every 1 second
    const sampleInterval = setInterval(() => {
      const fpsHistory = [...fpsWindowRef.current];
      const domNodeCount = document.getElementsByTagName('*').length;
      const jsHeapUsedMB = (performance as any)?.memory?.usedJSHeapSize
        ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        : undefined;

      if (workerRef.current) {
        const payload: DiagnosticInput = {
          fpsHistory,
          domNodeCount,
          jsHeapUsedMB,
          activeTimers: 2,
        };
        workerRef.current.postMessage(payload);
      } else {
        // Fallback main-thread calculation if worker isn't supported
        const sum = fpsHistory.reduce((acc, val) => acc + val, 0);
        const meanFps = fpsHistory.length > 0 ? sum / fpsHistory.length : 60;
        setMetrics({
          meanFps: Math.round(meanFps * 10) / 10,
          fpsVariance: 12,
          stutterSeverity: meanFps < 30 ? 'CRITICAL' : 'NONE',
          memoryPressureRatio: 0.35,
          domOverheadScore: Math.min(100, Math.round((domNodeCount / 1500) * 100)),
          bottleneckType: 'NONE'
        });
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearInterval(sampleInterval);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [isModalOpen]);

  return metrics;
}
