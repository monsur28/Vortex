const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function main() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setRequestInterception(true);
    page.on('request', request => {
        const url = request.url();
        if (url.includes('.mpd') || url.includes('.m3u8') || url.includes('key')) {
            console.log("INTERCEPTED:", url);
        }
        if (request.postData() && request.postData().includes('key')) {
             console.log("POST DATA:", request.postData());
        }
        request.continue();
    });

    await page.goto("https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h", { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 10000));
    console.log("Waiting finished");
    await browser.close();
}

main().catch(console.error);
