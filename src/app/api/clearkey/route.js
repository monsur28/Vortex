import { NextResponse } from 'next/server';
import * as channelsJson from '../../../../data/channels.json';
const channelsData = channelsJson.default || channelsJson;

export async function POST(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return new NextResponse('Missing id', { status: 400 });

  try {
    const channel = channelsData[parseInt(id, 10)];
    
    if (!channel || !channel.drm || !channel.drm.key) {
      return new NextResponse('No DRM key for this channel', { status: 404 });
    }

    const requestBody = await request.json();
    const requestedKids = requestBody.kids || [];

    // Parse channel DRM key
    let clearKeys = {};
    let keyStr = channel.drm.key;
    if (keyStr.startsWith('{')) {
      // JSON format
      try {
        let parsed = JSON.parse(keyStr);
        if (parsed.keys) {
          parsed.keys.forEach(k => { clearKeys[k.kid] = k.k; });
        }
      } catch (e) {}
    } else if (keyStr.includes(':')) {
      // hex format
      let [kidHex, keyHex] = keyStr.split(':');
      clearKeys[kidHex] = keyHex;
    }

    // Build standard ClearKey response
    const keys = [];
    if (requestedKids.length > 0) {
      for (const kid of requestedKids) {
        if (clearKeys[kid]) {
          keys.push({
            kty: 'oct',
            k: clearKeys[kid],
            kid: kid
          });
        }
      }
    } else {
      for (const kid in clearKeys) {
        keys.push({
          kty: 'oct',
          k: clearKeys[kid],
          kid: kid
        });
      }
    }

    return NextResponse.json({ keys });

  } catch (err) {
    console.error('ClearKey error', err);
    return new NextResponse('Error', { status: 500 });
  }
}
