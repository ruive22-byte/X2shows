import { validateAndNormalizeEpisode } from '../src/services/validationPipeline';

const fallbackEpisode = {
  id: 1526011,
  episode_number: 1,
  season_number: 1,
  name: 'Episode 1',
  overview: 'Fallback episode overview.',
  air_date: '2024-01-01',
  still_path: null,
  runtime: 24
};

const result = validateAndNormalizeEpisode(fallbackEpisode, 15260, 1, 1);
console.log(result);
