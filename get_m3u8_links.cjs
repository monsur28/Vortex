const fs = require('fs');
const https = require('https');

const channels = {
  "KickBD Edge": "https://source.kickbd.org/source/stream_33",
  "Fox One - 1": "https://source.kickbd.org/source/stream_14",
  "Fox One -1 [ALT]": "https://source.kickbd.org/source/stream_25",
  "Kickbd Extreme - 1 [4K]": "https://source.kickbd.org/source/stream_23",
  "Fox 4K [BDiX]": "https://source.kickbd.org/source/stream_39",
  "Caze TV - 1": "https://source.kickbd.org/source/stream_19",
  "D Sports - 1": "https://source.kickbd.org/source/stream_10",
  "ios Server 1 ": "https://source.kickbd.org/source/stream_30",
  "ios Server 2": "https://source.kickbd.org/source/stream_31",
  "ios Server 3": "https://source.kickbd.org/source/stream_32",
  "CTV": "https://source.kickbd.org/source/stream_11",
  "ITV FHD - 1": "https://source.kickbd.org/source/stream_24",
  "M6": "https://kickbd.org/source/m6_france_fhd",
  "Match Football": "https://source.kickbd.org/source/stream_18",
  "SporTV BR HD": "https://source.kickbd.org/source/stream_22",
  "TELEMUNDO USA": "https://kickbd.org/source/telemundo_usa",
  "TipiK FR FHD": "https://source.kickbd.org/source/stream_26",
  "TVE La 1 FHD": "https://source.kickbd.org/source/stream_35",
  "TUDN": "https://source.kickbd.org/source/stream_36",
  "VRT Sports FHD": "https://source.kickbd.org/source/stream_37",
  "WorldCupTV": "https://cdn.kickbd.org/source/wc_tv"
};

const results = {};

function fetchUrl(name, url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: { 'Referer': 'https://kickbd.org/' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // look for any url ending in m3u8 or mpd
                // Example: 'https:\/\/something\/index.m3u8'
                const match1 = data.match(/const\s+\w+\s*=\s*["']([^"']+\.(m3u8|mpd))["']/i);
                // Also look for direct assignment to sourceUrl or streamUrl
                const match2 = data.match(/["'](https?:\/\/[^"']+\.(m3u8|mpd))["']/i);
                
                if (match1 && match1[1]) {
                    results[name] = match1[1].replace(/\\/g, '');
                } else if (match2 && match2[1]) {
                    results[name] = match2[1].replace(/\\/g, '');
                } else if (data.includes("Redirecting") || res.statusCode === 301 || res.statusCode === 302) {
                    results[name] = "Redirecting / Protected";
                } else {
                    results[name] = "Could not find stream link";
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            results[name] = "Error fetching: " + e.message;
            resolve();
        });
    });
}

async function main() {
    const promises = [];
    for (const [name, url] of Object.entries(channels)) {
        promises.push(fetchUrl(name, url));
    }
    await Promise.all(promises);
    console.log(JSON.stringify(results, null, 2));
}

main();
