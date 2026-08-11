const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE EXCEPTION:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const content = await page.content();
  if (content.includes("Sign In Required")) {
      console.log("Auth Screen is Visible. Attempting login...");
      await page.fill('input[type="text"]', 'sylenul');
      await page.fill('input[type="password"]', 'Nulsyle202616!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const contentAfter = await page.content();
      if (contentAfter.includes("Sign In Required")) {
          console.log("Still on Auth Screen.");
          if (contentAfter.includes("Incorrect password") || contentAfter.includes("Invalid username")) {
              console.log("Login Error message shown.");
          }
      } else {
          console.log("Login successful, main UI rendered. DOM length:", contentAfter.length);
      }
  } else {
      console.log("Auth Screen is NOT visible.");
  }
  await browser.close();
})();
