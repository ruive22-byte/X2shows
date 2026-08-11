const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  console.log(content.substring(0, 1000));
  console.log("LENGTH:", content.length);
  await browser.close();
})();
