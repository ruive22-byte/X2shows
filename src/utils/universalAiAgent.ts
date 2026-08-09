export interface AiRequestPayload {
  task: 'BUG_FIX' | 'CODE_GEN' | 'SECURITY_PATCH' | 'AUDIT';
  context: Record<string, any>;
  systemRules?: string[];
}

export interface AiResponsePayload {
  success: boolean;
  modelUsed: string;
  reasoning?: string;
  codeFix?: string;
  error?: string;
}

export class UniversalAiAgent {
  private static OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
  private static DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

  /**
   * Health check to detect if local Ollama instance is online on port 11434
   */
  public static async isLocalOllamaActive(): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
      return res.ok;
    } catch {
      console.warn('ℹ️ Ollama not detected on port 11434. Falling back to DeepSeek/Gemini cloud endpoints.');
      return false;
    }
  }

  /**
   * Primary entry point: Queries local/primary AI first, falls back to cloud provider
   */
  public static async processTask(payload: AiRequestPayload): Promise<AiResponsePayload> {
    const prompt = this.buildStructuredPrompt(payload);

    // Tier 1: Try Local / High-Speed Open Model (e.g., Qwen 2.5 Coder or Llama 3.2 via Ollama)
    const localResult = await this.queryLocalModel('qwen2.5-coder:32b', prompt);
    if (localResult.success) {
      return localResult;
    }

    // Tier 2: Fallback to Cloud High-Reasoning Endpoint (DeepSeek / Gemini)
    console.warn('⚠️ Tier 1 AI offline or failed. Escalating to Tier 2 Cloud Model...');
    return await this.queryCloudModel(prompt);
  }

  private static buildStructuredPrompt(payload: AiRequestPayload): string {
    return `
System Role: You are an expert TypeScript/React software engineer and security auditor.
Task: ${payload.task}

App Constraints:
- UI Framework: React with Tailwind CSS
- Styling Rules: bg-[#07151e], border-2 border-black, shadow-[4px_4px_0px_#000000], accent #00f2fe
- Output Requirement: Return ONLY valid JSON matching this schema:
  {
    "reasoning": "Explanation of cause and solution",
    "codeFix": "Complete TypeScript code snippet",
    "verified": true
  }

Context & Error Log:
\`\`\`json
${JSON.stringify(payload.context, null, 2)}
\`\`\`
`.trim();
  }

  private static async queryLocalModel(modelName: string, prompt: string): Promise<AiResponsePayload> {
    try {
      const response = await fetch(this.OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) throw new Error(`Local model HTTP ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.response);

      return {
        success: true,
        modelUsed: modelName,
        reasoning: parsed.reasoning,
        codeFix: parsed.codeFix,
      };
    } catch (err: any) {
      return { success: false, modelUsed: modelName, error: err.message };
    }
  }

  private static async queryCloudModel(prompt: string): Promise<AiResponsePayload> {
    try {
      const meta = import.meta as any;
      const apiKey =
        (typeof import.meta !== 'undefined' && meta && meta.env && meta.env.VITE_AI_API_KEY) || '';

      const response = await fetch(this.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) throw new Error(`Cloud API HTTP ${response.status}`);

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      return {
        success: true,
        modelUsed: 'deepseek-coder',
        reasoning: parsed.reasoning,
        codeFix: parsed.codeFix,
      };
    } catch (err: any) {
      return { success: false, modelUsed: 'cloud-fallback', error: err.message };
    }
  }
}
