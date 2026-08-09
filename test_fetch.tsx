import { fetchAnimatedTvShows } from './src/services/tmdbApi';

async function run() {
  const data = await fetchAnimatedTvShows(1);
  const fionna = data.shows.find(s => s.title?.includes('Fionna'));
  console.log(fionna?.title);
  console.log(fionna?.poster_path);
  console.log(fionna?.posterUrl);
  console.log(fionna?.backdropUrl);
}
run();
