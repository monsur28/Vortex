import fs from 'fs';
import path from 'path';
import App from '../App';

export const dynamic = 'force-dynamic';

export default function Home() {
  // Load and sanitize channels on the server to prevent network tab fetching
  const filePath = path.join(process.cwd(), 'data', 'channels.json');
  let channels = [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawChannels = JSON.parse(fileContent);
    channels = rawChannels.map((channel, index) => {
      let targetUrl = channel.url || channel.stream_url || '';
      let originalUrls = targetUrl;
      if (!Array.isArray(originalUrls)) {
        originalUrls = [originalUrls];
      } else if (originalUrls.length > 0) {
        targetUrl = originalUrls[0];
      }
      
      return {
        name: channel.name || 'Unknown Channel',
        logo: channel.logo || '',
        group: channel.group || 'Other',
        id: index,
        url: targetUrl,
        isDash: targetUrl.includes('.mpd') || (channel.drm && channel.drm.type) ? true : false,
        hasDrm: !!channel.drm,
        drm: channel.drm,
        useProxy: !!channel.proxy,
        proxySegments: !!channel.proxySegments,
        urlCount: originalUrls.length,
        iframeUrl: targetUrl.startsWith('roarzone://') ? targetUrl : undefined
      };
    });
  } catch (error) {
    console.error('Failed to load channels on server', error);
  }

  return <App initialChannels={channels} />;
}
