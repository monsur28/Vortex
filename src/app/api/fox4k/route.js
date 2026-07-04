import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('https://vod.yagaverse.net/fox.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': 'https://kickbd.org/'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch upstream page' }, { status: 502 });
    }

    const html = await response.text();

    // Extract streamUrl
    const urlMatch = html.match(/const streamUrl = ["'](.*?)["'];/);
    if (!urlMatch) {
      return NextResponse.json({ error: 'Could not find streamUrl in source' }, { status: 500 });
    }
    
    // Convert backslashes for escaped quotes/slashes (e.g. \/ to /)
    const rawUrl = urlMatch[1].replace(/\\(.)/g, '$1');
    const urlObj = new URL(rawUrl);
    
    // The base url (e.g. https://bd.coffeey.xyz/fox/livestream76.mpd)
    const baseStreamUrl = urlObj.origin + urlObj.pathname;
    
    // The AWS token query parameters (e.g. ?X-Amz-Content-Sha256=...)
    const tokenQuery = urlObj.search;

    // Extract clearKeys
    // "1f68713028d439ec03be07f56c1d6213": "20093db6455160fffed4c394def3193d"
    const drmMatch = html.match(/"([a-f0-9]{32})"\s*:\s*"([a-f0-9]{32})"/);
    let clearKey = null;
    if (drmMatch) {
      clearKey = `${drmMatch[1]}:${drmMatch[2]}`;
    }

    return NextResponse.json({
      url: baseStreamUrl,
      token: tokenQuery,
      drmKey: clearKey
    });

  } catch (error) {
    console.error('Fox4K config fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
