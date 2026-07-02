const fs = require('fs');
const { encryptUrl } = require('./src/lib/encryption.js');

async function test() {
  const fetchOptions = {
    headers: {
      'Origin': 'https://fifalive.click',
      'Referer': 'https://fifalive.click/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    }
  };
  const response = await fetch('https://tahmidx.shusanta-project.workers.dev/', fetchOptions);
  const bodyText = await response.text();
  const baseUrl = new URL('https://tahmidx.shusanta-project.workers.dev/');
  const lines = bodyText.split('\n');
  const rewrittenLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    if (trimmed.startsWith('#')) {
      if (trimmed.includes('URI=\"')) {
         return line;
      }
      return line;
    }
    const absoluteUrl = new URL(trimmed, baseUrl.href).href;
    const tokenStr = encryptUrl(absoluteUrl);
    return '/api/proxy?token=' + encodeURIComponent(tokenStr);
  });
  console.log(rewrittenLines.join('\n').substring(0, 500));
}
test().catch(console.error);
