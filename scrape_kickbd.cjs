const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Intercept network requests
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('.m3u8')) {
      console.log('BINGO M3U8:', url);
    }
  });
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('.json')) {
      try {
        const text = await response.text();
        if (text.includes('m3u8')) {
          console.log('JSON M3U8:', text.substring(0, 500));
        }
      } catch (e) {}
    }
  });

  console.log('Navigating to KickBD Iframe...');
  await page.goto('https://kickbd.org/matches/iframe/fifa-world-cup-2026-round-of-32-14', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log('Iframe Content matches Toffee:', content.match(/[^"']*m3u8[^"']*/g));

  await browser.close();
})();
