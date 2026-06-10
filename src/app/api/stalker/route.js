import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const portal = url.searchParams.get('portal');
  const mac = url.searchParams.get('mac');
  const streamId = url.searchParams.get('streamId');

  if (!portal || !mac || !streamId) {
    return new NextResponse('Missing parameters (portal, mac, streamId)', { status: 400 });
  }

  const UA = 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 2 rev: 250 Safari/533.3';
  const headers = {
    'Cookie': `mac=${mac}`,
    'User-Agent': UA,
  };

  try {
    // 1. Handshake to get token
    let res = await fetch(`${portal}/server/load.php?type=stb&action=handshake&token=&JsHttpRequest=1-xml`, { headers });
    let data = await res.json();
    let token = data.js?.token;

    if (!token) {
      throw new Error('Failed to get token during handshake.');
    }

    // 2. Load profile (required by many portals to register session)
    await fetch(`${portal}/server/load.php?type=stb&action=get_profile&token=${token}&JsHttpRequest=1-xml`, { headers });

    // 3. Create active streaming link for the specific channel
    let cmd = encodeURIComponent(`ffmpeg http://localhost/ch/${streamId}_`);
    res = await fetch(`${portal}/server/load.php?type=itv&action=create_link&cmd=${cmd}&token=${token}&JsHttpRequest=1-xml`, { headers });
    data = await res.json();

    if (!data || !data.js || !data.js.cmd) {
      throw new Error('Portal failed to create stream link.');
    }

    let streamUrl = data.js.cmd;
    if (streamUrl.startsWith('ffmpeg ')) {
        streamUrl = streamUrl.replace('ffmpeg ', '');
    }

    // 4. Fetch the raw TS link without following redirects to discover the actual load balancer IP
    let tsRes = await fetch(streamUrl, { headers, redirect: 'manual' });
    let loadBalancerHost = null;
    if (tsRes.status === 301 || tsRes.status === 302) {
        let location = tsRes.headers.get('location');
        if (location) {
            loadBalancerHost = new URL(location).origin;
        }
    }

    if (!loadBalancerHost) {
        loadBalancerHost = new URL(portal).origin;
    }

    // 5. Fetch the actual M3U8 playlist from the portal
    let m3u8Url = streamUrl.replace('extension=ts', 'extension=m3u8');
    let m3u8Res = await fetch(m3u8Url, { headers });
    let m3u8Text = await m3u8Res.text();

    // 6. Rewrite the playlist to point chunks to the load balancer and wrap in our proxy
    let rewrittenLines = m3u8Text.split('\n').map(line => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        
        // If it's a relative chunk path, resolve it against the load balancer
        let absoluteChunkUrl = new URL(trimmed, loadBalancerHost).href;
        
        // Wrap it through our proxy to bypass CORS
        return `/api/proxy?url=${encodeURIComponent(absoluteChunkUrl)}&stalker=true`;
    });

    return new NextResponse(rewrittenLines.join('\n'), {
        headers: {
            'Content-Type': 'application/x-mpegURL',
            'Access-Control-Allow-Origin': '*'
        }
    });

  } catch (error) {
    console.error('Stalker error:', error);
    return new NextResponse('Stalker Error: ' + error.message, { status: 500 });
  }
}
