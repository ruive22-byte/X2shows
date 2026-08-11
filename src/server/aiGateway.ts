import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { Result } from '../services/validationPipeline';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (typeof window !== 'undefined') {
    throw new Error('Gemini API cannot be called from the client-side.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return geminiClient;
}

export interface AiAgentConfig<T> {
  prompt: string;
  schema: z.ZodType<T>;
  confidencePolicy?: (data: T) => boolean;
  businessValidation?: (data: T) => Result<T>;
  fallback: () => T;
}

export async function executeAiAgent<T>(config: AiAgentConfig<T>): Promise<Result<T>> {
  const client = getGeminiClient();
  
  if (!client) {
    return { success: true, data: config.fallback() };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: config.prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    
    // Safe extraction: stripping potential markdown code blocks
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7).trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3).trim();
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3).trim();
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(cleanedText);
    } catch (e) {
      return { success: false, error: new Error('Malformed JSON received from AI') };
    }

    const parseResult = config.schema.safeParse(rawJson);
    if (!parseResult.success) {
      return { success: false, error: new Error(`Schema validation failed: ${parseResult.error.message}`) };
    }

    let data = parseResult.data;

    if (config.businessValidation) {
      const bizResult = config.businessValidation(data);
      if (!bizResult.success) {
        return bizResult;
      }
      data = bizResult.data;
    }

    if (config.confidencePolicy) {
      const isConfident = config.confidencePolicy(data);
      if (!isConfident) {
        return { success: false, error: new Error('AI response did not pass confidence policy') };
      }
    }

    return { success: true, data };
  } catch (err: any) {
    const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      console.info('ℹ️ Gemini quota limit reached (429). Serving curated fallback seamlessly.');
      return { success: true, data: config.fallback() };
    }
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
