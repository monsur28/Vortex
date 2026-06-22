const https = require('https');
https.get('https://streampulse-iptv.mahmudulhasan.site/assets/index-BLyYNzhE.js', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const urls = data.match(/https?:\/\/[^"']+/g);
    if(urls) {
       console.log('Found URLs:', urls.filter(u => u.includes('.json') || u.includes('.m3u') || u.toLowerCase().includes('live')));
    }
    if(data.toLowerCase().includes('go live')) {
       console.log('Contains "go live" string');
    }
    // Print first 500 chars to see what it looks like
    console.log(data.substring(0, 500));
  });
});
