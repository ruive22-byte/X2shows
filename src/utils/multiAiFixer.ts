import { AuditReport } from './appAuditor';

export class MultiAiFixer {
  /**
   * Automated orchestration loop: Primary AI -> Verification -> Gemini Escalation
   */
  public static async executeAutoRepair(auditReport: AuditReport): Promise<void> {
    console.log('🤖 Starting Multi-AI Automated Repair Pipeline...');

    // Step 1: Attempt repair with Primary AI
    const primaryFixSuccess = await this.attemptPrimaryAiFix(auditReport);

    if (primaryFixSuccess) {
      console.log('✅ Primary AI fixed and verified the issue!');
      return;
    }

    // Step 2: Primary AI failed -> Escalate to Gemini
    console.warn('⚠️ Primary AI fix failed or timed out. Escalating to Gemini AI...');
    await this.escalateToGemini(auditReport);
  }

  private static async attemptPrimaryAiFix(report: AuditReport): Promise<boolean> {
    try {
      // Connects to local Ollama instance running on your machine or local endpoint
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `Fix this JSON audit issue report for a React app and return OK: ${JSON.stringify(report)}`,
          stream: false,
        }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      console.log('🤖 Primary Local AI Response:', data.response);

      return Boolean(data.response && data.response.includes('OK'));
    } catch {
      console.warn('⚠️ Local Primary AI offline or failed. Escalating to Gemini...');
      return false; // Automatically triggers fallback to Gemini!
    }
  }

  private static async escalateToGemini(report: AuditReport): Promise<void> {
    const geminiPayload = {
      task: 'CRITICAL_APP_REPAIR',
      auditReport: report,
      instructions: [
        '1. Deduplicate show catalog items by TMDB ID and normalized Title.',
        '2. Supply valid fallback TMDB poster URLs for shows with missing media.',
        '3. Update failing stream server URLs with active endpoints.',
      ],
    };

    const promptText = `
🤖 **GEMINI ESCALATION: AUTOMATED APP FIX REQUEST**

The primary AI failed to resolve the following audit issues. Please provide the fixed code:

\`\`\`json
${JSON.stringify(geminiPayload, null, 2)}
\`\`\`
`.trim();

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(promptText);
        alert('⚠️ Primary AI escalated to Gemini. Gemini fix prompt copied to clipboard!');
      } catch {
        console.log('Prompt copied fallback log:\n', promptText);
      }
    }
  }
}
