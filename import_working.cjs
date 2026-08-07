const fs = require('fs');

async function run() {
  console.log('Downloading iptv-org index.m3u...');
  const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
  const text = await res.text();
  
  const lines = text.split('\n');
  const channels = [];
  
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('#EXTINF:')) {
      current = {};
      const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) current.logo = logoMatch[1];
      
      const groupMatch = trimmed.match(/group-title="([^"]+)"/);
      if (groupMatch) {
          current.group = groupMatch[1];
      } else {
          current.group = "World Channels";
      }
      
      const commaIndex = trimmed.lastIndexOf(',');
      if (commaIndex > -1) {
        current.name = trimmed.substring(commaIndex + 1).trim();
      } else {
        current.name = 'Unknown Channel';
      }
    } else if (!trimmed.startsWith('#') && current) {
      current.url = trimmed;
      current.useProxy = false; // Default
      channels.push(current);
      current = null;
    }
  }

  const ourData = JSON.parse(fs.readFileSync('./data/channels.json', 'utf8'));
  const ourUrls = new Set(ourData.map(c => c.url));
  
  const newChannels = channels.filter(c => !ourUrls.has(c.url));
  console.log(`Found ${newChannels.length} new channels to validate.`);

  let working = [];
  let processed = 0;
  const concurrency = 200;
  let index = 0;

  async function worker() {
    while (index < newChannels.length) {
      const channel = newChannels[index++];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(channel.url, {
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
          working.push(channel);
        }
      } catch (err) {
        // failed
      }

      processed++;
      if (processed % 1000 === 0) {
        console.log(`Processed ${processed}/${newChannels.length} (Found Working: ${working.length})`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  console.log(`Finished validation. Adding ${working.length} new working channels.`);
  
  const updatedData = [...ourData, ...working];
  fs.writeFileSync('./data/channels.json', JSON.stringify(updatedData, null, 2));
  console.log('Successfully updated channels.json');
}

run();
