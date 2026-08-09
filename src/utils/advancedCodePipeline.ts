import { FastRouterAgent } from './fastRouterAgent';

export class AdvancedCodePipeline {
  /**
   * Executes a two-stage code modification request in under 2 seconds.
   */
  public static async executeFastBuild(
    userPrompt: string,
    getFileContent: (path: string) => string
  ): Promise<{ updatedCode: string; targetFile: string }> {
    console.time('⚡ Router Location Time');
    
    // Stage 1: Ultra-fast location resolution (< 200ms)
    const route = await FastRouterAgent.locateTargetFile(userPrompt);
    console.timeEnd('⚡ Router Location Time');

    console.log(`🎯 [Locator Agent] Target acquired: ${route.targetFile}`);

    // Stage 2: Fetch ONLY the targeted file content
    const existingCode = getFileContent(route.targetFile);

    const builderPrompt = `
Task: ${userPrompt}
Target File: ${route.targetFile}

Current Code Snippet:
\`\`\`tsx
${existingCode}
\`\`\`

Return ONLY the updated block or component code. Do not output explanations or full boilerplate.
    `;

    console.time('⚡ Code Generation Time');
    const response = await fetch('/api/gemini/builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: builderPrompt }),
    });

    const result = await response.json();
    console.timeEnd('⚡ Code Generation Time');

    return {
      updatedCode: result.text,
      targetFile: route.targetFile,
    };
  }
}
