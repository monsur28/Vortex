const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('.json') || url.includes('/api/')) {
      try {
        const text = await response.text();
        console.log('API RESPONSE:', url, '=>', text.substring(0, 300));
      } catch (e) {}
    }
  });
  console.log('Navigating...');
  await page.goto('https://kickbd.org/matches/iframe/fifa-world-cup-2026-round-of-32-14', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
