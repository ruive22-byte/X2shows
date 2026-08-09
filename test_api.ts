import { fetchAnimatedTvShows } from './src/services/tmdbApi.ts';

async function run() {
  try {
    const data = await fetchAnimatedTvShows(1);
    console.log("Success, got", data.shows.length, "shows");
    console.log("First show:", data.shows[0].title);
    if (data.shows[0].posterUrl) {
      console.log("First show has poster:", data.shows[0].posterUrl);
    }
  } catch (e) {
    console.error("Error running test:", e);
  }
}
run();
