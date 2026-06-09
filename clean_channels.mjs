import fs from 'fs';
import path from 'path';

const channelsPath = path.resolve('public/channels.json');
const backupPath = path.resolve('public/channels.backup.json');

// Backup original list
const rawData = fs.readFileSync(channelsPath, 'utf8');
fs.writeFileSync(backupPath, rawData);
const channels = JSON.parse(rawData);

const CONCURRENCY = 100;
const TIMEOUT_MS = 6000;

console.log(`Starting cleanup of ${channels.length} channels...`);

async function checkChannel(channel) {
  // Keep FIFA+ channels regardless of status
  if (channel.name.toLowerCase().includes('fifa+')) {
    return true;
  }

  const url = Array.isArray(channel.url) ? channel.url[0] : channel.url;
  
  // Exclude our own proxy relative paths from direct node testing, assume they are alive or test the real URL if we know it
  if (url.startsWith('/stream-proxy/')) {
    return true; 
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    // We do a fast GET request, only reading headers to save bandwidth
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
        'Accept': '*/*'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Some IPTV servers return 401/403 if token is expired, 
    // but 404 / 500 / 502 / 503 usually means dead.
    if (response.status >= 200 && response.status < 400) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function processChannels() {
  const aliveChannels = [];
  let processed = 0;
  let dead = 0;
  
  // Process in chunks for concurrency
  for (let i = 0; i < channels.length; i += CONCURRENCY) {
    const chunk = channels.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(async (ch) => {
      const isAlive = await checkChannel(ch);
      return { ch, isAlive };
    }));
    
    for (const res of results) {
      if (res.isAlive) {
        aliveChannels.push(res.ch);
      } else {
        dead++;
      }
      processed++;
    }
    
    process.stdout.write(`\rProcessed: ${processed}/${channels.length} | Dead found: ${dead}`);
  }
  
  console.log(`\n\nCleanup complete! Removed ${dead} dead channels.`);
  console.log(`Total active channels remaining: ${aliveChannels.length}`);
  
  fs.writeFileSync(channelsPath, JSON.stringify(aliveChannels, null, 2));
  console.log('Saved to public/channels.json');
}

processChannels();
