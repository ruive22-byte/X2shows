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
  
  await page.fill('input[type="text"]', 'sylenul');
  await page.fill('input[type="password"]', 'syle1');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Click the first card
  const cards = await page.$$('.aspect-\\[2\\/3\\]'); // Find poster cards
  if (cards.length > 0) {
      console.log(`Found ${cards.length} cards, clicking the first one...`);
      await cards[0].click();
      await page.waitForTimeout(1000);
      
      const playBtn = await page.$('text="Play Now"');
      if (playBtn) {
         console.log("Play button found, clicking to open WatchPage...");
         await playBtn.click();
         await page.waitForTimeout(2000);
         const content = await page.content();
         console.log("DOM length after clicking play:", content.length);
      } else {
         console.log("No Play Now button found.");
      }
  } else {
      console.log("No cards found.");
  }

  await browser.close();
})();
