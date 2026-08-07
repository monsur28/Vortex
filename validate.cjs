const fs = require('fs');

async function checkChannel(channel) {
  let url = channel.url || (Array.isArray(channel.stream_url) ? channel.stream_url[0] : channel.stream_url);

  // If there's no URL, skip it
  if (!url) {
    console.log(`[Removed] ${channel.name} - No URL provided`);
    return null;
  }

  // Assume proxy, DRM, and custom protocols are valid
  if (url.includes('proxy') || url.startsWith('roarzone://') || channel.drm || channel.useProxy) {
    return channel;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.body && response.body.cancel) {
      response.body.cancel();
    }

    if (response.ok || response.status === 403) { 
      return channel;
    } else {
      console.log(`[Removed] ${channel.name} - HTTP ${response.status} ${url}`);
      return null;
    }
  } catch (err) {
    console.log(`[Removed] ${channel.name} - Error: ${err.message} ${url}`);
    return null;
  }
}

async function validateChannels() {
  const data = JSON.parse(fs.readFileSync('./data/channels.json', 'utf8'));
  console.log(`Starting validation for ${data.length} channels...`);

  // Run in chunks to avoid maxing out connections
  const validChannels = [];
  const chunkSize = 20;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(checkChannel));
    validChannels.push(...results.filter(c => c !== null));
  }

  console.log(`Finished! Kept ${validChannels.length} out of ${data.length}`);
  fs.writeFileSync('./data/channels.json', JSON.stringify(validChannels, null, 2));
}

validateChannels();
