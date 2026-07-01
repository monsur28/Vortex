import fs from 'fs';
import http from 'http';
import https from 'https';

const CHANNELS_FILE = 'data/channels.json';
const TIMEOUT_MS = 5000; // 5 seconds timeout
const CONCURRENCY = 15; // Check 15 channels at a time

async function checkUrl(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        
        // Some servers reject HEAD requests, so we do a GET but abort it immediately if we get a good status
        const req = client.get(url, { timeout: TIMEOUT_MS }, (res) => {
            const isAlive = res.statusCode >= 200 && res.statusCode < 400;
            res.destroy(); // Abort downloading the actual video stream
            resolve(isAlive);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function processChannels() {
    console.log('Reading channels.json...');
    const data = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    
    console.log(`Checking ${data.length} channels... This might take a few minutes.`);
    
    const validChannels = [];
    let checkedCount = 0;

    // Process in chunks to avoid overwhelming the network
    for (let i = 0; i < data.length; i += CONCURRENCY) {
        const chunk = data.slice(i, i + CONCURRENCY);
        
        const results = await Promise.all(
            chunk.map(async (channel) => {
                const isAlive = await checkUrl(channel.url);
                return { channel, isAlive };
            })
        );

        for (const result of results) {
            if (result.isAlive) {
                validChannels.push(result.channel);
            }
        }
        
        checkedCount += chunk.length;
        process.stdout.write(`\rProgress: ${checkedCount} / ${data.length} (Found ${validChannels.length} alive)`);
    }

    console.log('\n\nCleanup complete!');
    console.log(`Original count: ${data.length}`);
    console.log(`Alive count: ${validChannels.length}`);
    console.log(`Removed: ${data.length - validChannels.length} dead channels.`);

    // Backup the original file just in case
    fs.writeFileSync(`${CHANNELS_FILE}.backup`, JSON.stringify(data, null, 2));
    console.log('Created backup at data/channels.json.backup');

    // Save the cleaned list
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(validChannels, null, 2));
    console.log('Saved alive channels back to data/channels.json');
}

processChannels().catch(console.error);
