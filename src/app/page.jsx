import App from '../App';
import channelsData from '../../data/channels.json';

export default function Home() {
  // Load and sanitize channels on the server to prevent network tab fetching
  let channels = [];
  try {
    const rawChannels = channelsData;
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
        useProxy: !!channel.proxy || !!channel.useProxy,
        proxySegments: !!channel.proxySegments,
        urlCount: originalUrls.length,
        iframeUrl: channel.iframeUrl || (targetUrl.startsWith('roarzone://') ? targetUrl : undefined),
        useNativeVideo: !!channel.useNativeVideo
      };
    });
  } catch (error) {
    console.error('Failed to load channels on server', error);
  }

  return <App initialChannels={channels} />;
}
