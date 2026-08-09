const fs = require('fs');
async function searchTvMaze(title) {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
  const data = await res.json();
  data.forEach(item => {
    console.log(item.show.name, item.show.premiered, item.show.image?.original);
  });
}
searchTvMaze('DuckTales');
