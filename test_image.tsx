import { resolvePoster } from './src/utils/posterResolver';

const item1 = {
  posterPath: '/abc.jpg'
};
const item2 = {
  posterUrl: 'https://tvmaze.com/test.jpg'
};
const item3 = {
  poster_path: '/def.jpg'
};

console.log(resolvePoster(item1));
console.log(resolvePoster(item2));
console.log(resolvePoster(item3));
