import type { GoogleGenAI } from '@google/genai';

export interface AgentResult<T> {
  value: T;
  source: 'gemini' | 'fallback';
  confidence: number;
  promptVersion: string;
}

export interface AgentDefinition<Input, Output> {
  name: string;
  promptVersion: string;
  parseInput: (value: unknown) => Input | null;
  prompt: (input: Input) => string;
  validateOutput: (value: unknown, input: Input) => value is Output;
  fallback: (input: Input) => Output;
  confidence: (value: Output, input: Input) => number;
}

export async function runAgent<Input, Output>(
  client: GoogleGenAI | null,
  definition: AgentDefinition<Input, Output>,
  payload: unknown,
  logger: Pick<Console, 'info' | 'warn'> = console,
): Promise<AgentResult<Output> | null> {
  const input = definition.parseInput(payload);
  if (!input) return null;
  if (!client) {
    const value = definition.fallback(input);
    return { value, source: 'fallback', confidence: definition.confidence(value, input), promptVersion: definition.promptVersion };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: definition.prompt(input),
        config: { responseMimeType: 'application/json', temperature: 0 },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (definition.validateOutput(parsed, input)) {
        return { value: parsed, source: 'gemini', confidence: definition.confidence(parsed, input), promptVersion: definition.promptVersion };
      }
      logger.warn(`[AI:${definition.name}] rejected schema-invalid output.`);
    } catch (error) {
      logger.warn(`[AI:${definition.name}] attempt ${attempt + 1} failed.`, error);
    }
  }

  const value = definition.fallback(input);
  return { value, source: 'fallback', confidence: definition.confidence(value, input), promptVersion: definition.promptVersion };
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';
const boundedString = (value: unknown, max = 500): value is string => typeof value === 'string' && value.length > 0 && value.length <= max;
const confidence = (value: unknown): number => typeof value === 'number' && value >= 0 && value <= 1 ? value : 0;

export const authDiagnosticAgent: AgentDefinition<{ status: number; message: string }, { action: 'retry' | 'reauthenticate' | 'contact_support'; reason: string; confidence: number }> = {
  name: 'AuthDiagnosticAgent', promptVersion: 'auth-diagnostic-v1',
  parseInput: (value) => isRecord(value) && Number.isInteger(value.status) && boundedString(value.message) ? { status: Number(value.status), message: value.message } : null,
  prompt: (input) => `Classify this authentication failure. Return JSON only: {"action":"retry|reauthenticate|contact_support","reason":"short reason","confidence":0..1}. Status: ${input.status}; message: ${input.message}`,
  validateOutput: (value): value is { action: 'retry' | 'reauthenticate' | 'contact_support'; reason: string; confidence: number } => isRecord(value) && ['retry', 'reauthenticate', 'contact_support'].includes(String(value.action)) && boundedString(value.reason) && confidence(value.confidence),
  fallback: (input) => ({ action: input.status === 401 ? 'reauthenticate' : 'retry', reason: 'Deterministic HTTP status policy.', confidence: 1 }),
  confidence: (value) => value.confidence,
};

export const sourceValidationAgent: AgentDefinition<{ url: string; providerId: number }, { accepted: boolean; reason: string; confidence: number }> = {
  name: 'SourceValidationAgent', promptVersion: 'source-validation-v1',
  parseInput: (value) => isRecord(value) && boundedString(value.url, 2_048) && Number.isInteger(value.providerId) && Number(value.providerId) > 0 ? { url: value.url, providerId: Number(value.providerId) } : null,
  prompt: (input) => `Review only this already-provider-validated playback source for obvious relationship inconsistencies. Do not invent an ID. Return JSON: {"accepted":boolean,"reason":"short","confidence":0..1}. providerId=${input.providerId}; url=${input.url}`,
  validateOutput: (value): value is { accepted: boolean; reason: string; confidence: number } => isRecord(value) && typeof value.accepted === 'boolean' && boundedString(value.reason) && confidence(value.confidence),
  fallback: () => ({ accepted: false, reason: 'AI validation unavailable; require deterministic source validation.', confidence: 1 }),
  confidence: (value) => value.confidence,
};

export const episodeMetadataAgent: AgentDefinition<{ providerId: number; seasonNumber: number; episodeNumber: number; title: string }, { title: string; synopsis: string; confidence: number }> = {
  name: 'EpisodeMetadataAgent', promptVersion: 'episode-metadata-v1',
  parseInput: (value) => isRecord(value) && [value.providerId, value.seasonNumber, value.episodeNumber].every((item) => Number.isInteger(item) && Number(item) > 0) && boundedString(value.title) ? { providerId: Number(value.providerId), seasonNumber: Number(value.seasonNumber), episodeNumber: Number(value.episodeNumber), title: value.title } : null,
  prompt: (input) => `Improve only this episode's presentation text; do not change providerId, season, or episode. Return JSON: {"title":"string","synopsis":"string","confidence":0..1}. providerId=${input.providerId}; season=${input.seasonNumber}; episode=${input.episodeNumber}; provider title=${input.title}`,
  validateOutput: (value): value is { title: string; synopsis: string; confidence: number } => isRecord(value) && boundedString(value.title) && boundedString(value.synopsis) && confidence(value.confidence),
  fallback: (input) => ({ title: input.title, synopsis: 'Synopsis unavailable.', confidence: 1 }),
  confidence: (value) => value.confidence,
};
