export type SpecificBugCategory =
  | 'HLS_MANIFEST_DECODE_FAILED'
  | 'TMDB_API_RATE_LIMITED'
  | 'IFRAME_SANDBOX_BLOCKED'
  | 'INDEXEDDB_QUOTA_EXCEEDED'
  | 'LAYOUT_RENDER_OVERFLOW'
  | 'UNHANDLED_PROMISE_REJECTION';

export interface SpecificBugReport {
  bugId: string;
  category: SpecificBugCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  summary: string;
  contextData: Record<string, any>;
  environment: {
    userAgent: string;
    screenResolution: string;
    timestamp: string;
  };
}

export class GeminiBugReporter {
  private static bugQueue: SpecificBugReport[] = [];

  /**
   * Captures a targeted runtime bug and packages it for Gemini
   */
  public static captureSpecificBug(
    category: SpecificBugCategory,
    summary: string,
    contextData: Record<string, any> = {},
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'HIGH'
  ): SpecificBugReport {
    const report: SpecificBugReport = {
      bugId: `BUG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      severity,
      summary,
      contextData,
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
        timestamp: new Date().toISOString(),
      },
    };

    this.bugQueue.push(report);
    console.warn(`[GeminiBugReporter] Captured targeted bug [${category}]:`, report);

    return report;
  }

  /**
   * Generates a fully formatted prompt tailored specifically for Gemini AI
   */
  public static formatGeminiPrompt(report: SpecificBugReport): string {
    return `
🤖 **GEMINI BUG DIAGNOSTIC REPORT**

**Bug ID:** \`${report.bugId}\`
**Category:** \`${report.category}\`
**Severity:** \`${report.severity}\`
**Summary:** ${report.summary}

---

### 🔍 Bug Context & Payload
\`\`\`json
${JSON.stringify(report.contextData, null, 2)}
\`\`\`

---

### 💻 Environment
- **User Agent:** \`${report.environment.userAgent}\`
- **Viewport:** \`${report.environment.screenResolution}\`
- **Timestamp:** \`${report.environment.timestamp}\`

---

### 🎯 Gemini Action Request
Please analyze this specific bug and provide:
1. **Root Cause Analysis:** Why did this \`${report.category}\` error occur in my React/TypeScript streaming setup?
2. **Exact Code Fix:** Provide the updated TypeScript/React snippet to resolve this bug cleanly without breaking surrounding imports or state.
`.trim();
  }

  /**
   * Attaches global listeners for unhandled promise rejections and streaming errors
   */
  public static initGlobalErrorWatchers(): void {
    if (typeof window === 'undefined') return;

    // Catch uncaught async promise rejections (e.g. failed fetch / HLS decode)
    window.addEventListener('unhandledrejection', (event) => {
      this.captureSpecificBug(
        'UNHANDLED_PROMISE_REJECTION',
        event.reason?.message || 'Unhandled promise rejection in async stream pipeline',
        { reason: String(event.reason), stack: event.reason?.stack },
        'HIGH'
      );
    });
  }
}
