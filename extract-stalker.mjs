import fs from 'fs';

const PORTAL_URL = 'http://prm.worldip.nl:80';
const MAC_ADDRESS = '00:1A:79:C1:92:55';

async function fetchStalker(action, type = 'stb', token = '') {
    const url = `${PORTAL_URL}/server/load.php?type=${type}&action=${action}&token=${token}&JsHttpRequest=1-xml`;
    console.log('Fetching:', url);
    const response = await fetch(url, {
        headers: {
            'Cookie': `mac=${MAC_ADDRESS}; stb_lang=en; timezone=Europe/London;`,
            'User-Agent': 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 2 rev: 250 Safari/533.3',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
    });
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON:', text.substring(0, 200));
        return null;
    }
}

async function extract() {
    console.log(`Extracting from ${PORTAL_URL} with MAC ${MAC_ADDRESS}...`);
    
    // 1. Handshake to get token
    const handshake = await fetchStalker('handshake');
    if (!handshake || !handshake.js || !handshake.js.token) {
        console.error('Handshake failed or token missing.');
        return;
    }
    const token = handshake.js.token;
    console.log('Got token:', token);
    
    // 2. Get user profile (sometimes required)
    await fetchStalker('get_profile', 'stb', token);
    
    // 3. Get all channels
    console.log('Fetching channels...');
    const channelsData = await fetchStalker('get_all_channels', 'itv', token);
    
    if (!channelsData || !channelsData.js) {
        console.error('Failed to get channels.');
        return;
    }
    
    const channels = channelsData.js.data || channelsData.js;
    console.log(`Found ${channels.length} channels!`);
    
    // 4. Extracting links is tricky because Stalker requires calling 'create_link' 
    // for each channel ID right before playing. Let's try to grab the first 5 links as a test.
    
    const sample = [];
    for (let i = 0; i < Math.min(5, channels.length); i++) {
        const ch = channels[i];
        console.log(`Getting link for: ${ch.name} (ID: ${ch.id})`);
        
        // Command to create link:
        const linkData = await fetchStalker(`create_link&cmd=${encodeURIComponent(ch.cmd)}`, 'itv', token);
        if (linkData && linkData.js && linkData.js.cmd) {
            let streamUrl = linkData.js.cmd;
            // Sometimes it returns format "ffmpeg http://..." 
            if (streamUrl.startsWith('ffmpeg ')) streamUrl = streamUrl.replace('ffmpeg ', '');
            
            sample.push({
                name: ch.name,
                url: streamUrl,
                logo: ch.logo
            });
        }
    }
    
    console.log('Sample extracted channels:');
    console.log(JSON.stringify(sample, null, 2));
    
    fs.writeFileSync('stalker_sample.json', JSON.stringify(sample, null, 2));
    console.log('Saved to stalker_sample.json');
}

extract().catch(console.error);
