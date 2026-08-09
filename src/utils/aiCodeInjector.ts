// src/utils/aiCodeInjector.ts
import { AIRateGovernor } from './aiRateGovernor';

export interface CodeInjectionSpec {
  targetFilePath: string;
  insertionAnchor: string; // The exact string or function signature to insert after
  codeToInject: string;
  importsToAdd: string[];
}

export class AICodeInjector {
  /**
   * Generates a surgical code insertion patch instead of rewriting full files.
   */
  public static async planFunctionInjection(
    newFunctionDescription: string,
    targetFileContent: string,
    targetFilePath: string
  ): Promise<CodeInjectionSpec> {
    const prompt = `
You are an Ultra-Fast AST Code Injector Agent.

TARGET FILE (${targetFilePath}):
\`\`\`tsx
${targetFileContent.slice(0, 1500)} // Truncated header & signature context
\`\`\`

TASK:
We need to add this new function/AI capability: "${newFunctionDescription}"

Find the single best anchor line to insert the code (e.g., right after an existing state hook, helper function, or API route).
Return ONLY a raw JSON object (no markdown, no explanations):
{
  "targetFilePath": "${targetFilePath}",
  "insertionAnchor": "const [existingState, setExistingState] = useState(...);",
  "codeToInject": "// New function implementation here",
  "importsToAdd": ["import { NewAgent } from '../utils/newAgent';"]
}
    `.trim();

    const fallback: CodeInjectionSpec = {
      targetFilePath,
      insertionAnchor: '// TODO: Insert new logic here',
      codeToInject: `// Auto-generated function: ${newFunctionDescription}\nexport function handle${newFunctionDescription.replace(/[^a-zA-Z0-9]/g, '')}() {\n  console.log("Mock implementation of: ${newFunctionDescription}");\n}`,
      importsToAdd: []
    };

    try {
      const result = await AIRateGovernor.execute(
        async () => {
          const response = await fetch('/api/gemini/router', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (!data || typeof data.text !== 'string') {
            throw new Error('Malformed router response format');
          }

          const cleanJson = data.text.replace(/```json|```/g, '').trim();
          return JSON.parse(cleanJson) as CodeInjectionSpec;
        },
        'USER',
        fallback
      );

      return result || fallback;
    } catch (error) {
      console.warn('⚠️ [AICodeInjector] Failed to plan code injection. Returning fallback:', error);
      return fallback;
    }
  }
}
