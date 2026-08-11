import { z } from 'zod';
const ExternalEpisodeSchema = z.object({
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
const raw = {
  id: 1526011,
  episode_number: 1,
  season_number: 1,
  name: 'Episode 1',
  overview: 'Fallback episode overview.',
  air_date: '2024-01-01',
  still_path: null,
  runtime: 24
};
const res = ExternalEpisodeSchema.safeParse(raw);
console.log(res.success, res.error);
