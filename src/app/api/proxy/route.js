import { NextResponse } from 'next/server';
import { encryptUrl, decryptUrl } from '../../../lib/encryption';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request) {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get('url'); // keep for backward compatibility temporarily if needed, but we will rely on token or id
  const id = url.searchParams.get('id');
  const idx = parseInt(url.searchParams.get('idx') || '0', 10);
  const token = url.searchParams.get('token');
  const isStalker = url.searchParams.get('stalker') === 'true';

  if (id !== null) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'channels.json');
      const channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const channel = channels[parseInt(id, 10)];
      let channelUrl = channel ? (channel.url || channel.stream_url) : null;
      if (channelUrl && !targetUrl) {
        if (Array.isArray(channelUrl)) {
          targetUrl = channelUrl[idx] || channelUrl[0];
        } else {
          targetUrl = channelUrl;
        }
      }
    } catch (e) {
      return new NextResponse('Error loading channel data', { status: 500 });
    }
  } else if (token) {
    targetUrl = decryptUrl(token);
  }

  // Handle relative targetUrls (e.g. starting with /stream-proxy/)
  if (targetUrl && targetUrl.startsWith('/')) {
    const origin = url.origin;
    targetUrl = new URL(targetUrl, origin).href;
  }

  if (!targetUrl) {
    console.error('Target URL missing!', { id, targetUrl: url.searchParams.get('url'), token });
    return new NextResponse('Missing valid id or token parameter', { status: 400 });
  }

  console.log(`PROXY REQUEST: targetUrl=${targetUrl}, method=${request.method}`);

  // Handle roarzone token generation dynamically
  if (targetUrl.startsWith('roarzone://')) {
    const streamName = targetUrl.replace('roarzone://', '');
    try {
      const roarHtml = await fetch(`https://tv.roarzone.net/player.php?stream=${streamName}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }).then(r => r.text());
      const match = roarHtml.match(/(http.*?roarzone.*?.m3u8.*?token=.*?['\"])/);
      if (match) {
        targetUrl = match[1].replace(/['"]$/, '');
      } else {
        return new NextResponse('Failed to extract RoarZone token. HTML: ' + roarHtml.substring(0, 500), { status: 500 });
      }
    } catch (e) {
      return new NextResponse('Error fetching RoarZone token: ' + e.message, { status: 500 });
    }
  }

  // Use a standard Chrome User-Agent for non-Stalker URLs to bypass Cloudflare/403 blocks
  // But for Xtream (.ts) streams, use VLC to avoid being blocked by IPTV providers.
  let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  
  if (isStalker) {
    userAgent = 'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 2 rev: 250 Safari/533.3';
  } else if (targetUrl && (targetUrl.endsWith('.ts') || targetUrl.includes('.ts?'))) {
    userAgent = 'VLC/3.0.9 LibVLC/3.0.9';
  }

  const fetchHeaders = {
    'User-Agent': userAgent,
    'Accept': '*/*'
  };


  // Apply custom headers from channel config (e.g. Referer, Origin)
  if (id !== null) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'channels.json');
      const channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const channel = channels[parseInt(id, 10)];
      if (channel && channel.headers) {
        Object.assign(fetchHeaders, channel.headers);
      }
    } catch (e) { /* ignore */ }
  }

  if (isStalker) {
    const targetUrlObj = new URL(targetUrl);
    const mac = targetUrlObj.searchParams.get('mac');
    if (mac) {
      fetchHeaders['Cookie'] = `mac=${mac}; stb_lang=en; timezone=Europe/London;`;
    }
  }

  const isDevALive = targetUrl.includes('dev-a-live.pantheonsite.io');

  const fetchOptions = {
    method: 'GET',
    headers: fetchHeaders,
    redirect: isDevALive ? 'manual' : 'follow'
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);

    if (isDevALive && response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const absoluteLocation = new URL(location, targetUrl).href;
        const redirectHeaders = new Headers(response.headers);
        redirectHeaders.set('location', absoluteLocation);
        redirectHeaders.set('Access-Control-Allow-Origin', '*');
        
        return new NextResponse(null, {
          status: response.status,
          headers: redirectHeaders
        });
      }
    }

    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.set('Access-Control-Allow-Origin', '*');
    
    if (!response.ok) {
      console.warn(`Proxy upstream returned ${response.status} for ${targetUrl}`);
      headers.set('X-Debug-Upstream-Status', response.status.toString());
      headers.set('X-Debug-Target-Url', targetUrl);
    }
    
    const contentType = (headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8') || targetUrl.includes('extension=m3u8')) {
      headers.delete('content-length');
      const bodyText = await response.text();
      const baseUrl = new URL(targetUrl);
      
      const lines = bodyText.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/, (match, uri) => {
              if (uri.startsWith('data:')) return match;
              const absoluteUrl = new URL(uri, baseUrl.href).href;
              const tokenStr = encryptUrl(absoluteUrl);
              const proxiedUrl = `/api/proxy?token=${encodeURIComponent(tokenStr)}${isStalker ? '&stalker=true' : ''}${id !== null ? `&id=${id}` : ''}`;
              return `URI="${proxiedUrl}"`;
            });
          }
          return line;
        }
        
        const absoluteUrl = new URL(trimmed, baseUrl.href).href;
        const tokenStr = encryptUrl(absoluteUrl);
        return `/api/proxy?token=${encodeURIComponent(tokenStr)}${isStalker ? '&stalker=true' : ''}${id !== null ? `&id=${id}` : ''}`;
      });
      
      return new NextResponse(rewrittenLines.join('\n'), {
        status: response.status,
        headers
      });
    } else if (contentType.includes('dash+xml') || targetUrl.includes('.mpd')) {
      headers.delete('content-length');
      let bodyText = await response.text();
      
      // We no longer strip ContentProtection tags because Shaka Player handles them robustly
      // and needs them to identify the DRM system properly.

      // Fix BaseURL so relative segments resolve to the original CDN, not the proxy
      const urlObj = new URL(targetUrl);
      const mpdBaseUrl = urlObj.search ? targetUrl.substring(0, targetUrl.indexOf(urlObj.search)) : targetUrl;
      const absoluteBaseUrl = mpdBaseUrl.substring(0, mpdBaseUrl.lastIndexOf('/') + 1);
      
      if (bodyText.includes('<BaseURL>')) {
        // Replace any existing BaseURL (could be relative like "dash/") with absolute CDN URL
        bodyText = bodyText.replace(/<BaseURL>[^<]*<\/BaseURL>/gi, (match) => {
          const existingUrl = match.replace(/<\/?BaseURL>/g, '');
          // If it's already absolute, leave it alone
          if (existingUrl.startsWith('http://') || existingUrl.startsWith('https://')) {
            return match;
          }
          // Convert relative BaseURL to absolute
          return `<BaseURL>${absoluteBaseUrl}${existingUrl}</BaseURL>`;
        });
      } else {
        // Inject a new absolute BaseURL after the <MPD> tag
        bodyText = bodyText.replace(/(<MPD[^>]*>)/i, `$1\n  <BaseURL>${absoluteBaseUrl}</BaseURL>`);
      }


      return new NextResponse(bodyText, {
        status: response.status,
        headers
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  } catch (error) {
    return new NextResponse('Proxy error: ' + error.message, { status: 500 });
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get('url');
  const token = url.searchParams.get('token');

  if (token) {
    targetUrl = decryptUrl(token);
  }

  if (!targetUrl) {
    return new NextResponse('Missing valid url or token parameter for POST', { status: 400 });
  }

  const bodyBuffer = await request.arrayBuffer();

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': request.headers.get('content-type') || 'application/octet-stream',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    body: bodyBuffer
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    return new NextResponse('Proxy POST error: ' + error.message, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    }
  });
}

export async function HEAD(request) {
  return GET(request);
}

