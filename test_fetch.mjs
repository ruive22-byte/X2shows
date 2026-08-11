async function run() {
  const loginRes = await fetch('http://localhost:3000/api/tmdb/proxy?path=/tv/15260/season/1');
  console.log(loginRes.status);
  console.log(await loginRes.text());
}
run();
