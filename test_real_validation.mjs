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
  air_date: '2010-09-27',
  episode_number: 26,
  episode_type: 'finale',
  id: 537632,
  name: 'Gut Grinder',
  overview: "When the Fluffy People's gold has been devoured by a culprit only known as The Gut Grinder, Finn and Jake team up to find him with his tracks.",
  production_code: '692-024',
  runtime: 11,
  season_number: 1,
  show_id: 15260,
  still_path: '/8qTS50QoolfVljhkWm7B8gGiTcs.jpg',
  vote_average: 7.35,
  vote_count: 20
};
const res = ExternalEpisodeSchema.safeParse(raw);
console.log(res.success, res.error);
