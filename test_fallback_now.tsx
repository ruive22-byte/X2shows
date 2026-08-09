import { getNextFallbackArtwork } from './src/services/apiFallbackService';

async function run() {
  const artwork = await getNextFallbackArtwork('Attack on Titan', 'primary', 'http://failed', null, null);
  console.log(artwork);
}
run();
