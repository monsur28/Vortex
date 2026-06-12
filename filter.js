const fs = require('fs');
const channels = JSON.parse(fs.readFileSync('data/channels.json', 'utf8'));
const filtered = channels.filter(c => c.name.toLowerCase().includes('fifa') || c.name.toLowerCase().includes('world cup') || c.name.toLowerCase().includes('sports') || c.group.toLowerCase().includes('sports'));
// Wait, the user said "remove the all channel other then world cup channel". 
// So only keep those matching world cup.
const worldCupChannels = channels.filter(c => c.name.toLowerCase().includes('fifa') || c.name.toLowerCase().includes('world cup'));
fs.writeFileSync('data/channels.json', JSON.stringify(worldCupChannels, null, 2));
console.log('Kept', worldCupChannels.length, 'channels.');
