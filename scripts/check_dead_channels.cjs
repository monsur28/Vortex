const fs = require('fs');
const path = require('path');

const CHANNELS_PATH = path.join(__dirname, '../data/channels.json');
const DELETED_PATH = path.join(__dirname, '../data/deleted_channels.json');

// Disable TLS rejection for the script to prevent false positives from bad SSL certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkChannel(channel) {
  if (!channel.url) return { channel, isDead: true, reason: 'No URL' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Only fetch headers to save bandwidth
    const res = await fetch(channel.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeoutId);

    // If 404 Not Found, it's definitively dead.
    // We ignore 403 and 500 because of anti-bot protections.
    if (res.status === 404) {
      return { channel, isDead: true, reason: '404 Not Found' };
    }

    return { channel, isDead: false };
  } catch (error) {
    // If we fail with HEAD, try GET with Range header (some streams reject HEAD)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(channel.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Range': 'bytes=0-1024'
        }
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        return { channel, isDead: true, reason: '404 Not Found (GET)' };
      }

      return { channel, isDead: false };
    } catch (e) {
      // Definitive failure (timeout, DNS error, ENOTFOUND, etc)
      return { channel, isDead: true, reason: e.name === 'AbortError' ? 'Timeout' : e.message };
    }
  }
}

async function run() {
  console.log('Reading channels...');
  const channels = JSON.parse(fs.readFileSync(CHANNELS_PATH, 'utf8'));
  console.log(`Checking ${channels.length} channels...`);

  // Process in batches of 50 to avoid maxing out connections
  const batchSize = 50;
  const keep = [];
  const dead = [];

  for (let i = 0; i < channels.length; i += batchSize) {
    const batch = channels.slice(i, i + batchSize);
    const promises = batch.map(c => checkChannel(c));
    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.isDead) {
        dead.push(result);
      } else {
        keep.push(result.channel);
      }
    }
    
    console.log(`Processed ${Math.min(i + batchSize, channels.length)} / ${channels.length}...`);
  }

  console.log(`\nResults:`);
  console.log(`Working / Kept: ${keep.length}`);
  console.log(`Dead / Removed: ${dead.length}`);

  // Save the kept channels
  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(keep, null, 4));
  
  // Save the dead channels for review
  if (dead.length > 0) {
    fs.writeFileSync(DELETED_PATH, JSON.stringify(dead, null, 4));
  }
  console.log('\nCleanup complete! Dead channels saved to data/deleted_channels.json for review.');
}

run();
