const fs = require('fs');
const channels = JSON.parse(fs.readFileSync('data/channels.json', 'utf8'));
const worldCupChannels = channels.filter(c => c.name.toLowerCase().includes('fifa') || c.name.toLowerCase().includes('world cup'));
fs.writeFileSync('data/channels.json', JSON.stringify(worldCupChannels, null, 2));
console.log('Kept', worldCupChannels.length, 'channels.');
