const fetch = require('node-fetch');

async function run() {
  const loginRes = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'mock-password-not-used' })
  });
  console.log(await loginRes.text());
}
run();
