const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('request', request => {
    const url = request.url();
    if (url.includes('.m3u8')) {
      console.log('M3U8_FOUND:', url);
    }
  });

  try {
    await page.setExtraHTTPHeaders({
      'Referer': 'https://foxtrend.gd/'
    });
    await page.goto('https://embed.st/embed/echo/ivory-coast-vs-norway-football-1564789/3', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch(e) {}
  
  await browser.close();
})();
