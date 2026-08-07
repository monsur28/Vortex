const fs = require('fs');

async function run() {
  console.log('Downloading iptv-org index.m3u...');
  const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
  const text = await res.text();
  
  const lines = text.split('\n');
  const urls = lines.filter(l => l && !l.startsWith('#')).map(l => l.trim());
  console.log(`Total URLs in index.m3u: ${urls.length}`);

  const ourData = JSON.parse(fs.readFileSync('./data/channels.json', 'utf8'));
  const ourUrls = new Set(ourData.map(c => c.url));
  
  let duplicates = 0;
  for (const url of urls) {
    if (ourUrls.has(url)) duplicates++;
  }
  console.log(`Duplicates in our channels.json: ${duplicates}`);

  console.log('Starting validation (this will take a few minutes)...');
  let working = 0;
  let offline = 0;
  let processed = 0;

  const concurrency = 200;
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const url = urls[index++];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (resp.body && resp.body.cancel) {
          resp.body.cancel();
        }

        if (resp.ok || resp.status === 403) {
          working++;
        } else {
          offline++;
        }
      } catch (err) {
        offline++;
      }

      processed++;
      if (processed % 1000 === 0) {
        console.log(`Processed ${processed}/${urls.length} (Working: ${working}, Offline: ${offline})`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  console.log('\n--- Final Results ---');
  console.log(`Total Channels: ${urls.length}`);
  console.log(`Working Channels: ${working}`);
  console.log(`Offline/Broken Channels: ${offline}`);
  console.log(`Duplicates in our list: ${duplicates}`);
}

run();
