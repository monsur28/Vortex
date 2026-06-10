import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.set('Access-Control-Allow-Origin', '*');
    
    const contentType = headers.get('content-type') || '';
    if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
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
              const proxiedUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
              return `URI="${proxiedUrl}"`;
            });
          }
          return line;
        }
        
        const absoluteUrl = new URL(trimmed, baseUrl.href).href;
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });
      
      return new NextResponse(rewrittenLines.join('\n'), {
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
