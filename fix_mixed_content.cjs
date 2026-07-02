const fs = require('fs');
const filepath = 'data/channels.json';
let channels = JSON.parse(fs.readFileSync(filepath, 'utf8'));

for (let i = 0; i < channels.length; i++) {
  const name = channels[i].name ? channels[i].name.toLowerCase() : '';
  if (name === 'ptv-sports' || name === 'somoy tv') {
    channels[i].useProxy = true;
    console.log(`Enabled proxy for ${channels[i].name} to fix Mixed Content error.`);
  }
}

fs.writeFileSync(filepath, JSON.stringify(channels, null, 2));
console.log('channels.json updated.');
