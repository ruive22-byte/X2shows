export class AiAssistantHandler {
  public static generateBugFixPrompt(errorTitle: string, errorDetails: Record<string, any>): string {
    return `
🤖 **GEMINI BUG FIX PROMPT**

**Issue:** ${errorTitle}

### 🔍 Details & Payload
\`\`\`json
${JSON.stringify(errorDetails, null, 2)}
\`\`\`

### 🎯 Request
Please analyze the error details above and provide a complete TypeScript/React code fix.
`.trim();
  }

  public static async copyToClipboard(text: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  }
}
