const fs = require('fs');
const { execSync } = require('child_process');

try {
    const oldContent = execSync('git show HEAD:"data/channels.json"', { encoding: 'utf8' });
    const oldChannels = JSON.parse(oldContent);
    const currentChannels = JSON.parse(fs.readFileSync('e:/Web Development Journey/Day 92 - IPTV/IPTV/data/channels.json', 'utf8'));

    const channelsToRestore = ['World Cup TV', 'TSN FHD - 1', 'Fox One'];
    const restored = oldChannels.filter(c => channelsToRestore.includes(c.name));

    currentChannels.unshift(...restored);

    fs.writeFileSync('e:/Web Development Journey/Day 92 - IPTV/IPTV/data/channels.json', JSON.stringify(currentChannels, null, 4));
    console.log('Restored:', restored.map(c => c.name));
} catch(e) {
    console.error(e);
}
