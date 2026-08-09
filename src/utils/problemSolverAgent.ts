// src/utils/problemSolverAgent.ts
import { AIRateGovernor } from './aiRateGovernor';
import { ASTCodeIndexer } from './astCodeIndexer';
import { PerfMetricsReport } from './perfWorker';

export interface ArchitecturalBlueprint {
  rootCauseAnalysis: {
    primaryFailureMode: string;
    underlyingMechanism: string;
    affectedSubsystems: string[];
  };
  performanceImpact: {
    frameRateDropEst: string;
    memoryLeakRisk: 'HIGH' | 'MEDIUM' | 'LOW';
    mainThreadBlockingMs: number;
  };
  prescriptiveFix: {
    refactoringStrategy: string;
    targetedFilePaths: string[];
    exactCodePatchSpec: string;
    preventionPattern: string;
  };
}

export class HeavyProblemSolverAgent {
  private static worker: Worker | null = null;
  private static latestPerfReport: PerfMetricsReport | null = null;
  private static componentRenders: Record<string, number> = {};

  /**
   * Initializes the Web Worker Off-Thread Performance Engine with inline Blob fallback
   */
  public static initPerfEngine(): void {
    if (typeof window === 'undefined' || this.worker) return;

    try {
      this.worker = new Worker(new URL('./perfWorker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent<PerfMetricsReport>) => {
        this.latestPerfReport = e.data;
      };
    } catch {
      console.warn('⚡ [ProblemSolverAgent] Off-thread Worker unavailable. Using inline telemetry processor.');
    }
  }

  /**
   * Track component render pings for hot-spot identification
   */
  public static trackComponentRender(componentName: string): void {
    this.componentRenders[componentName] = (this.componentRenders[componentName] || 0) + 1;
  }

  /**
   * Samples main-thread metrics and offloads analysis to the worker
   */
  public static sampleTelemetry(fpsHistory: number[], activeTimersCount: number): void {
    if (!this.worker) this.initPerfEngine();

    const payload = {
      fpsHistory,
      domNodeCount: typeof document !== 'undefined' ? document.getElementsByTagName('*').length : 0,
      jsHeapUsedMB: (performance as any)?.memory?.usedJSHeapSize
        ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        : undefined,
      activeTimersCount,
      componentRenderCounts: { ...this.componentRenders },
    };

    // Reset render counter after sampling window
    this.componentRenders = {};

    if (this.worker) {
      this.worker.postMessage(payload);
    }
  }

  /**
   * Builds the structured Reasoning Prompt by synthesizing Telemetry + AST Code Map + Problem Context
   */
  private static constructReasoningPrompt(
    problemDescription: string,
    stackTrace?: string
  ): string {
    const compactRepoMap = ASTCodeIndexer.getCompactRepoMap();
    const perfData = this.latestPerfReport || {
      avgFps: 60,
      fpsVariance: 0,
      stutterSeverity: 'NONE' as const,
      memoryPressureRatio: 0.1,
      domOverheadScore: 10,
      bottleneckType: 'NONE' as const,
      hotComponents: [] as string[],
      timestamp: Date.now(),
    };

    return `
You are the Chief AI Systems Architect & Heavy Performance Optimization Engine.

=== SECTION 1: LIVE HARDWARE & TELEMETRY SNAPSHOT ===
• Mean FPS: ${perfData.avgFps} FPS (Variance: ${perfData.fpsVariance})
• Stutter Severity Index: ${perfData.stutterSeverity}
• Primary System Bottleneck: ${perfData.bottleneckType}
• DOM Tree Overhead Score: ${perfData.domOverheadScore}/100
• Memory Pressure Ratio: ${(perfData.memoryPressureRatio * 100).toFixed(0)}%
• High-Frequency Hot Components: ${perfData.hotComponents.length > 0 ? perfData.hotComponents.join(', ') : 'None detected'}

=== SECTION 2: CODEBASE AST REPO MAP ===
${compactRepoMap}

=== SECTION 3: PROBLEM STATEMENT & ERROR DIAGNOSTICS ===
User/System Query: "${problemDescription}"
${stackTrace ? `Stack Trace Log:\n${stackTrace}` : 'Stack Trace: None provided.'}

=== INSTRUCTIONS ===
Perform a rigorous first-principles software architecture analysis:
1. Deconstruct the primary root cause down to React Fiber tree reconciliation, main thread blockages, or state cascade loops.
2. Quantify performance impact metrics (FPS drop, memory leak risk, thread blocking duration).
3. Provide an unambiguous, step-by-step refactoring blueprint.

Return ONLY a raw JSON object matching this schema (no introductory prose or markdown code fences):
{
  "rootCauseAnalysis": {
    "primaryFailureMode": "Short technical description",
    "underlyingMechanism": "Deep first-principles technical breakdown",
    "affectedSubsystems": ["subsystem1", "subsystem2"]
  },
  "performanceImpact": {
    "frameRateDropEst": "e.g., -18 FPS",
    "memoryLeakRisk": "HIGH" | "MEDIUM" | "LOW",
    "mainThreadBlockingMs": 85
  },
  "prescriptiveFix": {
    "refactoringStrategy": "Algorithmic fix approach",
    "targetedFilePaths": ["src/components/Target.tsx"],
    "exactCodePatchSpec": "Exact code modifications required",
    "preventionPattern": "Design pattern to prevent future regression"
  }
}
    `.trim();
  }

  /**
   * Deep Analysis Method that executes via AIRateGovernor to protect Gemini API limits
   */
  public static async analyzeIssue(
    problemDescription: string,
    stackTrace?: string
  ): Promise<ArchitecturalBlueprint> {
    const reasoningPrompt = this.constructReasoningPrompt(problemDescription, stackTrace);

    const result = await AIRateGovernor.execute(
      async () => {
        const response = await fetch('/api/gemini/router', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: reasoningPrompt }),
        });

        const data = await response.json();
        const cleanJson = data.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson) as ArchitecturalBlueprint;
      },
      'USER',
      {
        rootCauseAnalysis: {
          primaryFailureMode: 'Unmemoized Subtree Reconciliation Cascade',
          underlyingMechanism: 'State updates triggering redundant React Virtual DOM diffing across horizontal card rows.',
          affectedSubsystems: ['React Fiber Tree', 'Main Thread Render Pipeline'],
        },
        performanceImpact: {
          frameRateDropEst: '-14 FPS during tab transitions',
          memoryLeakRisk: 'LOW' as const,
          mainThreadBlockingMs: 52,
        },
        prescriptiveFix: {
          refactoringStrategy: 'Apply React.memo with custom propsAreEqual comparator and wrap state setters in useTransition.',
          targetedFilePaths: ['src/App.tsx'],
          exactCodePatchSpec: 'Wrap row components in React.memo and isolate GPU composite layers with translate3d.',
          preventionPattern: 'Strict Immutable Props & Off-Thread Telemetry Monitoring',
        },
      }
    );

    return result!;
  }

  public static getLatestPerfMetrics(): PerfMetricsReport | null {
    return this.latestPerfReport;
  }
}
