import { normalizeCatalogItem } from './src/utils/normalizer';

async function run() {
  const item = {
    title: 'Adventure Time: Fionna & Cake',
    poster_path: '/c5p2zD0r3O4Fw1O4vR3E2v0B2r.jpg'
  };
  const norm = await normalizeCatalogItem(item);
  console.log(norm);
}
run();
