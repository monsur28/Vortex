const fs = require('fs');
const channels = JSON.parse(fs.readFileSync('data/channels.json', 'utf8'));
channels.forEach(ch => {
    if (ch.url && (ch.url.includes('aiv-cdn.net') || ch.url.includes('pv-cdn.net'))) {
        ch.useProxy = true;
        ch.proxySegments = true;
    }
});
fs.writeFileSync('data/channels.json', JSON.stringify(channels, null, 2));
console.log('Fixed channels.json');
