import { z } from 'zod';
import { TmdbShowId, SeasonNumber, EpisodeNumber, createTmdbShowId, createSeasonNumber, createEpisodeNumber } from '../types/identifiers';

// 1. Define strict runtime schemas for external AI / Provider payloads
export const ExternalEpisodeSchema = z.object({
  id: z.number().int().positive(),
  season_number: z.number().int().nonnegative().optional(),
  episode_number: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  overview: z.string().optional().default(''),
  still_path: z.string().nullable().optional(),
  air_date: z.string().optional(),
  vote_average: z.number().optional(),
  runtime: z.number().optional()
});

export type RawExternalEpisode = z.infer<typeof ExternalEpisodeSchema>;

// 2. Define the Canonical Domain Model output
export interface CanonicalEpisode {
  readonly id: number;
  readonly providerId: TmdbShowId;
  readonly seasonNumber: SeasonNumber;
  readonly number: EpisodeNumber;
  readonly title: string;
  readonly overview: string;
  readonly stillUrl: string | null;
  readonly airDate: string;
  readonly voteAverage: number;
  readonly runtimeMinutes: number;
}

// 3. The Strict Pipeline Execution Wrapper
export type Result<T, E = Error> = 
  | { success: true; data: T } 
  | { success: false; error: E };

export function validateAndNormalizeEpisode(
  rawInput: unknown, 
  providerShowId: number,
  fallbackSeason: number = 1,
  fallbackEpisodeNumber: number = 1
): Result<CanonicalEpisode> {
  // Step A: Schema Validation via Zod
  const parseResult = ExternalEpisodeSchema.safeParse(rawInput);
  
  if (!parseResult.success) {
    return { 
      success: false, 
      error: new Error(`Schema validation failed: ${parseResult.error.message}`) 
    };
  }

  const validData = parseResult.data;

  // Step B: Business Rule Validation & Brand Casting
  const sNum = validData.season_number ?? fallbackSeason;
  const epNum = validData.episode_number ?? fallbackEpisodeNumber;

  if (sNum === 0 && epNum > 100) {
    return { success: false, error: new Error('Business rule violation: Abnormal specials index detected.') };
  }

  const canonical: CanonicalEpisode = {
    id: validData.id,
    providerId: createTmdbShowId(providerShowId),
    seasonNumber: createSeasonNumber(sNum),
    number: createEpisodeNumber(epNum),
    title: validData.name || `Episode ${epNum}`,
    overview: validData.overview || 'Synopsis unavailable.',
    stillUrl: validData.still_path ? `https://image.tmdb.org/t/p/w500${validData.still_path}` : null,
    airDate: validData.air_date || '',
    voteAverage: validData.vote_average || 8.5,
    runtimeMinutes: validData.runtime || 24,
  };

  return { success: true, data: canonical };
}
