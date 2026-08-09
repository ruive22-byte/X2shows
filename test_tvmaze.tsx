import { searchTvMazeShow } from './src/services/apiFallbackService';

async function run() {
  const show = await searchTvMazeShow('Invincible');
  console.log(show?.image);
}
run();
