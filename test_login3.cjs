const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="text"]', 'sylenul');
  await page.fill('input[type="password"]', 'Nulsyle202616!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  const contentAfter = await page.content();
  if (contentAfter.includes("Sign In Required")) {
      console.log("FAILED to login with Nulsyle202616!");
  } else {
      console.log("SUCCESS logging in with Nulsyle202616!");
  }
  await browser.close();
})();
