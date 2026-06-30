import json

with open('e:\\Web Development Journey\\Day 92 - IPTV\\IPTV\\fetch_fifa_new.html', 'r', encoding='utf-8') as f:
    data = f.read()

channels = []
current = {}
for line in data.split('\n'):
    line = line.strip()
    if line.startswith('#EXTINF:'):
        current['name'] = line.split(',')[-1].strip()
        current['group'] = 'FIFA World Cup 2026'
        current['logo'] = "https://image.tsports.com/images/mobile_thumbnail/1761718928-1750064430-LIVE.jpg"
        current['useProxy'] = True
        current['proxySegments'] = True
    elif line and not line.startswith('#'):
        current['url'] = line
        channels.append(current)
        current = {}

print(json.dumps(channels, indent=4))
