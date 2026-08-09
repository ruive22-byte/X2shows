import { ASTCodeIndexer } from './astCodeIndexer';

export interface LocationRoute {
  targetFile: string;
  targetSymbol?: string;
  reason: string;
}

export class FastRouterAgent {
  public static async locateTargetFile(userPrompt: string): Promise<LocationRoute> {
    const repoMap = ASTCodeIndexer.getCompactRepoMap();

    const routerPrompt = `
You are a ultra-fast Code Locator. Given this project manifest:
${repoMap}

User Request: "${userPrompt}"

Identify the EXACT file that must be modified. 
Return ONLY a raw JSON object with no markdown formatting:
{"targetFile": "src/components/Example.tsx", "targetSymbol": "ComponentName", "reason": "short reason"}
    `;

    try {
      const response = await fetch('/api/gemini/router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: routerPrompt }),
      });

      const data = await response.json();
      const cleanJson = data.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Router fallback active, defaulting to targeted search');
      return { targetFile: 'src/App.tsx', reason: 'Fallback route' };
    }
  }
}
