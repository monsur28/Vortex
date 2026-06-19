const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

puppeteer.use(StealthPlugin());

// Define the mapping of Channel Name to its Sportzfy source URL
const SPORTZFY_SOURCES = {
  "M6 FRANCE": "https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h",
  // TODO: Add the other channel URLs here!
  // "FOX": "...",
  // "TSN 1": "..."
};

const CHANNELS_FILE = path.join(__dirname, '../data/channels.json');

async function extractStreamInfo(page, url) {
    console.log(`[+] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for Cloudflare to pass and the player to load
    await new Promise(r => setTimeout(r, 5000));

    const html = await page.content();
    
    // Regex to find MPD URL
    const mpdRegex = /(https:\/\/[^"']+\.mpd)/i;
    const mpdMatch = html.match(mpdRegex);
    const mpdUrl = mpdMatch ? mpdMatch[1] : null;

    // Regex to find ClearKey (format: hex:hex or base64)
    // Sportzfy usually passes it as a JSON object in the source code or an auth token
    let clearKeyObj = null;
    
    // Look for JW Player or Shaka player config with clearkey
    const keyRegex = /"clear[kK]ey"\s*:\s*\{?\s*"([^"]+)"\s*:\s*"([^"]+)"/i;
    const keyMatch = html.match(keyRegex);
    
    // Alternatively, look for the standard "keyId:key" format often used
    const hexKeyRegex = /([a-f0-9]{32}):([a-f0-9]{32})/i;
    const hexMatch = html.match(hexKeyRegex);

    if (keyMatch) {
       clearKeyObj = { keyId: keyMatch[1], key: keyMatch[2] };
    } else if (hexMatch) {
       clearKeyObj = `${hexMatch[1]}:${hexMatch[2]}`;
    }

    // Try to find if there is a specific token
    const tokenRegex = /token=([^"'\s&]+)/i;
    const tokenMatch = html.match(tokenRegex);

    if (!mpdUrl) {
       console.log(`[-] Could not find MPD URL on the page.`);
       return null;
    }

    return { mpdUrl, clearKeyObj, htmlSnippet: html.substring(0, 1000) };
}

async function main() {
    console.log('🚀 Starting Sportzfy Channel Updater...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set a normal user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf8'));
    let updatedCount = 0;

    for (const [channelName, sourceUrl] of Object.entries(SPORTZFY_SOURCES)) {
        console.log(`\n======================================`);
        console.log(`Processing: ${channelName}`);
        
        const result = await extractStreamInfo(page, sourceUrl);
        if (result && result.mpdUrl) {
            console.log(`[✓] Found MPD: ${result.mpdUrl}`);
            if (result.clearKeyObj) {
                console.log(`[✓] Found ClearKey:`, result.clearKeyObj);
            }

            // Find the channel in channels.json and update it
            const channel = channels.find(c => c.name.includes(channelName));
            if (channel) {
                channel.url = result.mpdUrl;
                if (result.clearKeyObj) {
                    if (typeof result.clearKeyObj === 'string') {
                         channel.drm = { type: 'clearkey', key: result.clearKeyObj };
                    } else {
                         channel.drm = { type: 'clearkey', keyId: result.clearKeyObj.keyId, key: result.clearKeyObj.key };
                    }
                }
                updatedCount++;
                console.log(`[✓] Updated ${channelName} in database.`);
            } else {
                console.log(`[-] ${channelName} not found in channels.json!`);
            }
        }
    }

    await browser.close();

    if (updatedCount > 0) {
        console.log(`\n💾 Saving channels.json...`);
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));

        console.log(`☁️ Pushing updates to GitHub...`);
        try {
            execSync('git add data/channels.json');
            execSync('git commit -m "Auto-update Sportzfy DRM keys"');
            execSync('git push');
            console.log(`[✓] Successfully pushed to Vercel!`);
        } catch(e) {
            console.log(`[-] Git push failed (maybe no changes to commit)`);
        }
    } else {
        console.log(`\n[-] No channels were updated.`);
    }

    console.log('✅ Done!');
}

main().catch(console.error);
