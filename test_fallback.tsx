import { getNextFallbackArtwork } from './src/services/apiFallbackService';

async function run() {
  const artwork = await getNextFallbackArtwork('Invincible', 'primary', 'http://failed', null, null);
  console.log(artwork);
}
run();
