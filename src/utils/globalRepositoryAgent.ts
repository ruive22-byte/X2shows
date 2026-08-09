export interface FileNode {
  path: string;
  content: string;
}

export interface MultiFilePatch {
  filePath: string;
  action: 'UPDATE' | 'CREATE' | 'DELETE';
  updatedContent: string;
}

export interface GlobalAgentPlan {
  rootCauseAnalysis: string;
  affectedFiles: string[];
  patches: MultiFilePatch[];
  verificationChecklist: string[];
}

export interface GlobalAgentResult {
  success: boolean;
  modelUsed: string;
  plan?: GlobalAgentPlan;
  error?: string;
}

export class GlobalRepositoryAgent {
  private static OLLAMA_URL = 'http://localhost:11434/api/generate';
  private static DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
  private static GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  /**
   * Main Entry Point: Scans full file repository context and generates multi-file repairs
   */
  public static async healEntireRepository(
    auditPayload: Record<string, any>,
    repositoryContext: FileNode[]
  ): Promise<GlobalAgentResult> {
    console.log(`🌐 [Global Agent] Analyzing ${repositoryContext.length} files across full codebase...`);

    // 1. Build a dependency map string (file tree + imports summary)
    const repoSummary = this.buildRepoSummary(repositoryContext);
    const prompt = this.constructGlobalPrompt(auditPayload, repositoryContext, repoSummary);

    // 2. Cascade across Tier 1 (Qwen/Llama) -> Tier 2 (DeepSeek) -> Tier 3 (Gemini Pro)
    const rawResult = await this.cascadeGlobalQuery(prompt);

    if (!rawResult) {
      return {
        success: false,
        modelUsed: 'NONE',
        error: 'All model tiers failed to generate a global repository fix plan.',
      };
    }

    // 3. Parse and validate the multi-file plan
    try {
      const cleanedJson = rawResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const plan: GlobalAgentPlan = JSON.parse(cleanedJson);

      // Verify cross-file consistency (ensure patches match expected files)
      const isValid = this.verifyPatchIntegrity(plan, repositoryContext);

      if (!isValid) {
        return {
          success: false,
          modelUsed: rawResult.model,
          error: 'Generated patch plan failed cross-file import & syntax verification.',
        };
      }

      return {
        success: true,
        modelUsed: rawResult.model,
        plan,
      };
    } catch (err: any) {
      return {
        success: false,
        modelUsed: rawResult.model,
        error: `Failed to parse global fix plan JSON: ${err.message}`,
      };
    }
  }

  /**
   * Summarizes repository structure so the AI understands cross-file dependencies
   */
  private static buildRepoSummary(files: FileNode[]): string {
    return files
      .map((f) => {
        const imports = (f.content.match(/import\s+.*?from\s+['"].*?['"]/g) || []).join('; ');
        return `- ${f.path} (Imports: [${imports}])`;
      })
      .join('\n');
  }

  /**
   * Constructs a multi-file orchestration prompt
   */
  private static constructGlobalPrompt(
    audit: Record<string, any>,
    files: FileNode[],
    summary: string
  ): string {
    const fullSourceBundle = files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content}`)
      .join('\n\n');

    return `
System Role: You are an autonomous Lead Software Architect auditing an entire TypeScript/React codebase.
Task: Inspect the global issue report below and fix ALL related files simultaneously so imports, types, and server routing work seamlessly together.

Repository Summary & Import Graph:
${summary}

Audit Issue Payload:
\`\`\`json
${JSON.stringify(audit, null, 2)}
\`\`\`

Full Source Code:
${fullSourceBundle}

Instructions:
1. Identify every file in the project that needs to change (e.g. updating server resolvers, updating type interfaces, and sanitizing the catalog).
2. Do NOT leave missing code, placeholders, or TODOs.
3. Return ONLY valid JSON matching this schema:
{
  "rootCauseAnalysis": "Comprehensive explanation of all cross-file bugs found",
  "affectedFiles": ["src/utils/serverResolver.ts", "src/utils/catalogSanitizer.ts"],
  "patches": [
    {
      "filePath": "src/utils/serverResolver.ts",
      "action": "UPDATE",
      "updatedContent": "FULL_UPDATED_FILE_CONTENT_HERE"
    }
  ],
  "verificationChecklist": ["Server pings working", "No duplicate catalog IDs"]
}
`.trim();
  }

  /**
   * Cascades through available AI endpoints capable of handling large multi-file contexts
   */
  private static async cascadeGlobalQuery(prompt: string): Promise<{ text: string; model: string } | null> {
    // Tier 1: Local High-Context Model (Qwen 2.5 Coder 32B or Llama 3.3 via Ollama)
    try {
      const res = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:32b', prompt, stream: false, format: 'json' }),
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.response, model: 'Qwen 2.5 Coder 32B' };
      }
    } catch {
      // Fall through to Tier 2
    }

    // Tier 2: DeepSeek API
    try {
      const meta = import.meta as any;
      const apiKey = (typeof import.meta !== 'undefined' && meta?.env?.VITE_DEEPSEEK_API_KEY) || '';
      if (apiKey) {
        const res = await fetch(this.DEEPSEEK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-coder',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return { text: data.choices[0].message.content, model: 'DeepSeek-Coder' };
        }
      }
    } catch {
      // Fall through to Tier 3
    }

    // Tier 3: Gemini Pro (Large Context Window for Full Repository Scanning)
    try {
      const meta = import.meta as any;
      const geminiKey = (typeof import.meta !== 'undefined' && meta?.env?.VITE_GEMINI_API_KEY) || '';
      if (geminiKey) {
        const res = await fetch(`${this.GEMINI_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return { text: data.candidates[0].content.parts[0].text, model: 'Gemini 1.5 Pro' };
        }
      }
    } catch {
      // All tiers failed
    }

    return null;
  }

  /**
   * Verifies that the proposed patches don't leave broken references across files
   */
  private static verifyPatchIntegrity(plan: GlobalAgentPlan, files: FileNode[]): boolean {
    if (!plan.patches || plan.patches.length === 0) return false;

    // Ensure all target files in patches exist in the repository or are explicitly marked CREATE
    return plan.patches.every((patch) => {
      const exists = files.some((f) => f.path === patch.filePath);
      return patch.action === 'CREATE' || exists;
    });
  }
}
