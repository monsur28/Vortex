const https = require('https');
const streams = {
  'Fox One - 1': 'https://source.kickbd.org/source/stream_14',
  'Fox 4K [BDiX]': 'https://source.kickbd.org/source/stream_39',
  'Fox One -1 [ALT]': 'https://source.kickbd.org/source/stream_25',
  'TUDN': 'https://source.kickbd.org/source/stream_36'
};
async function getKeys() {
  for (const [name, url] of Object.entries(streams)) {
    await new Promise((resolve) => {
      https.get(url, { headers: { 'Referer': 'https://kickbd.org/' } }, (res) => {
        let data = '';
        res.on('data', c => data+=c);
        res.on('end', () => {
          const match = data.match(/clearKeys:\s*\{\s*"([a-f0-9]+)"\:\s*"([a-f0-9]+)"/i);
          if (match) {
            console.log(name + ' -> KID: ' + match[1] + ' | KEY: ' + match[2]);
          } else {
            console.log(name + ' -> No ClearKeys found');
          }
          resolve();
        });
      });
    });
  }
}
getKeys();
